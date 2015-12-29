var webpack = require('webpack')
var config = require('./webpack.base.conf')

config.devtool = 'source-map'

config.vue.loaders = {
  js: 'babel!eslint'
}

// http://vuejs.github.io/vue-loader/workflow/production.html
config.plugins = (config.plugins || []).concat([
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.OccurenceOrderPlugin()
])

module.exports = config
