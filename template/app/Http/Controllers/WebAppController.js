'use strict'

const Env = use('Env')
const Config = use('Config')
const Helpers = use('Helpers')
const fs = require('fs')
const path = require('path')
const serialize = require('serialize-javascript')
const promisify = require('es6-promisify')
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer
const ansiHTML = require('ansi-html')
const vueConfig = Config.get('vue')
const encodeHtml = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;')

class AppController {

  constructor () {
    this.renderer = null
    this.isProd = Env.get('NODE_ENV') === 'production'
    this.isDev = Env.get('NODE_ENV') === 'development'
    if (this.isProd) {
      const bundlePath = path.resolve(Helpers.publicPath(), vueConfig.outputDir, vueConfig.filenames.server)
      this._createRenderer(fs.readFileSync(bundlePath, 'utf-8'))
    }
    if (this.isDev) {
      this._createWebpackMiddlewares()
      this._webpackWatchAndUpdate()
    }
  }

  getContext (request) {
    // Context given to resources/src/server-entry.js
    // You can for example get the authenticated user apiKey here and give it
    // to the vue.js app so all the API calls will be authenticated
    return {
      url: request.url()
    }
  }

  * render (request, response) {
    if (!this.renderer) {
      yield this._waitFor(1000)
      yield this.render(request, response)
      return
    }
    // Call webpack middlewares only in development
    if (this.isDev) {
      yield this._webpackMiddlewares(request, response)
    }

    const context = this.getContext(request)
    try {
      const html = yield this.renderToString(context)
      yield response.sendView('app', {
        isProd: this.isProd, // Use to add the extracted CSS <link> in production
        APP: html,
        context: context,
        serialize: serialize,
        files: {
          css: path.join('/', vueConfig.outputDir, vueConfig.filenames.css),
          clientVendor: path.join('/', vueConfig.outputDir, vueConfig.filenames.clientVendor),
          client: path.join('/', vueConfig.outputDir, vueConfig.filenames.client)
        }
      })
    } catch (err) {
      // throw err
      yield response.status(500).sendView('errors/vue', { err, ansiHTML, encodeHtml })
    }
  }

  _createRenderer (bundle) {
    // Create bundle renderer to give a fresh context for every request
    let cacheConfig = false
    if (this.isProd && Config.get('vue.cache')) {
      cacheConfig = require('lru-cache')({
        max: Config.get('vue.cacheOptions.max', 1000),
        maxAge: Config.get('vue.cacheOptions.max', 1000 * 60 * 15)
      })
    }
    this.renderer = createBundleRenderer(bundle, {
      cache: cacheConfig
    })
    this.renderToString = promisify(this.renderer.renderToString)
  }

  _webpackWatchAndUpdate () {
    // Watch and update server renderer
    const webpack = require('webpack')
    const MFS = require('memory-fs') // <- dependencies of webpack
    const mfs = new MFS()
    const serverConfig = require(path.resolve(Helpers.configPath(), vueConfig.webpack.serverConfig))
    const serverCompiler = webpack(serverConfig)
    const outputPath = path.join(serverConfig.output.path, serverConfig.output.filename)
    serverCompiler.outputFileSystem = mfs
    serverCompiler.watch({}, (err, stats) => {
      if (err) throw err
      stats = stats.toJson()
      stats.errors.forEach(err => console.error(err))
      stats.warnings.forEach(err => console.warn(err))
      this._createRenderer(mfs.readFileSync(outputPath, 'utf-8'))
    })
  }

  _createWebpackMiddlewares () {
    const webpack = require('webpack')
    const clientConfig = require(path.resolve(Helpers.configPath(), vueConfig.webpack.clientConfig))

    // setup on the fly compilation + hot-reload
    clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
    clientConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    )

    const clientCompiler = webpack(clientConfig)
    // Add the middlewares to the instance context
    this.webpackDevMiddleware = promisify(require('webpack-dev-middleware')(clientCompiler, {
      publicPath: clientConfig.output.publicPath,
      stats: {
        colors: true,
        chunks: false
      }
    }))
    this.webpackHotMiddleware = promisify(require('webpack-hot-middleware')(clientCompiler))
  }

  * _webpackMiddlewares (request, response) {
    yield this.webpackDevMiddleware(request.request, response.response)
    yield this.webpackHotMiddleware(request.request, response.response)
  }

  * _waitFor (ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, (ms || 0))
    })
  }

}

// Config for ansi-html
ansiHTML.setColors({
  reset: ['efefef', 'a6004c'],
  darkgrey: '5a012b',
  yellow: 'ffab07',
  green: 'aeefba',
  magenta: 'ff84bf',
  blue: '3505a0',
  cyan: '56eaec',
  red: '4e053a'
})

// Exports the instance so the constructor is called only once
module.exports = new AppController()
