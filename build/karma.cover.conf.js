var webpackConf = require('./webpack.base.conf')
delete webpackConf.entry

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../coverage', subdir: '.' },
        { type: 'text-summary', dir: '../coverage', subdir: '.' }
      ]
    },
    files: ['../test/unit/index.js'],
    preprocessors: {
      '../test/unit/index.js': ['webpack']
    },
    webpack: webpackConf,
    webpackMiddleware: {
      noInfo: true
    },
    modules: {
      postLoaders: {
        test: /\.js$/,
        exclude: /test|node_modules/,
        loader: 'istanbul-instrumenter'
      }
    }
  })

}
