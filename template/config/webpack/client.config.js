const webpack = require('webpack')
const base = require('./base.config')
const vueConfig = require('./vue-loader.config')
const filenames = require('../vue').filenames

/*
|--------------------------------------------------------------------------
| Webpack Client Config
|
| Generate public/dist/client-vendor-bundle.js
| Generate public/dist/client-bundle.js
|
| In production, will generate public/dist/style.css
|--------------------------------------------------------------------------
*/

const config = Object.assign({}, base, {
  output: Object.assign({}, base.output, {
    filename: filenames.client
  }),
  plugins: (base.plugins || []).concat([
    // strip comments in Vue code
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    // extract vendor chunks for better caching
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: filenames.clientVendor
    })
  ])
})

if (process.env.NODE_ENV === 'production') {
  // Use ExtractTextPlugin to extract CSS into a single file
  // so it's applied on initial render
  const ExtractTextPlugin = require('extract-text-webpack-plugin')

  // vueConfig is already included in the config via LoaderOptionsPlugin
  // here we overwrite the loader config for <style lang='stylus'>
  // so they are extracted.
  vueConfig.loaders = {
    css: ExtractTextPlugin.extract({ loader: 'css-loader' }),
    scss: ExtractTextPlugin.extract({ loader: 'css-loader!sass-loader', fallbackLoader: 'vue-style-loader' }),
    sass: ExtractTextPlugin.extract({ loader: 'css-loader!sass-loader?indentedSyntax', fallbackLoader: 'vue-style-loader' }),
    stylus: ExtractTextPlugin.extract({ loader: 'css-loader!stylus-loader', fallbackLoader: 'vue-style-loader' }),
    less: ExtractTextPlugin.extract({ loader: 'css-loader!less-loader', fallbackLoader: 'vue-style-loader' })
  }

  config.plugins.push(
    new ExtractTextPlugin(filenames.css),
    // this is needed in webpack 2 for minifying CSS
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    // minify JS
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  )
}

module.exports = config
