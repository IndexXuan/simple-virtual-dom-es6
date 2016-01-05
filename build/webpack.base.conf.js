var path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../dist/static'),
    publicPath: '/static/',
    filename: 'build.js'
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      'src': path.resolve(__dirname, '../src')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel!eslint',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  }
}
