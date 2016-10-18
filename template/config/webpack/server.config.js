const path = require('path')
const resolve = file => path.resolve(__dirname, file)
const webpack = require('webpack')
const base = require('./base.config')
const filenames = require('../vue').filenames

/*
|--------------------------------------------------------------------------
| Webpack Server Config
|--------------------------------------------------------------------------
*/
module.exports = Object.assign({}, base, {
  target: 'node',
  devtool: false,
  entry: resolve('../../resources/src/server-entry.js'),
  output: Object.assign({}, base.output, {
    filename: filenames.server,
    libraryTarget: 'commonjs2'
  }),
  externals: Object.keys(require('../../package.json').dependencies),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"'
    })
  ]
})
