const webpackConfig = require('./webpack.config.test.js');

module.exports = (config) => {
    config.set({
        singleRun: true,
        colors: true,
        logLevel: config.LOG_ERROR,

        files: [
            './test/index.js',
        ],

        preprocessors: {
            'test/index.js': 'webpack'
        },

        frameworks: ['mocha'],
        browsers: ['PhantomJS'],
        reporters: ['spec', 'coverage', 'threshold'],

        webpack: webpackConfig,

        webpackMiddleware: {
            noInfo: true,
        },

        coverageReporter: {
            type : 'lcov',
            dir : './coverage/',
            subdir: '.'
        },

        thresholdReporter: {
            statements: 95,
            branches: 95,
            functions: 95,
            lines: 95
        },

        plugins: [
            'karma-spec-reporter',
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-coverage',
            'karma-threshold-reporter',
            'karma-webpack'
        ],
    });
};
