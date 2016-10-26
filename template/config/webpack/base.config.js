const path = require('path')
const resolve = file => path.resolve(__dirname, file)
const CleanWebpackPlugin = require('clean-webpack-plugin')
const vueLoaderConfig = require('./vue-loader.config')
const outputDir = require('../vue').outputDir

/*
|--------------------------------------------------------------------------
| Webpack Shared Config
|
| This is the config which is extented by the server and client
| webpack config files
|--------------------------------------------------------------------------
*/
module.exports = {
  devtool: '#source-map',
  entry: {
    app: resolve('../../resources/src/client-entry.js'),
    vendor: ['vue', 'vue-router', 'vuex', 'es6-promise']
  },
  output: {
    path: resolve('../../public/' + outputDir),
    publicPath: path.join('/', outputDir, '/')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url',
        options: {
          limit: 1000, // 1KO
          name: 'img/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 1000, // 1 KO
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin([ outputDir ], {
      root: resolve('../../public')
    })
  ]
}
