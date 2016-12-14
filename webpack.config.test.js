"use strict";

const webpack = require('webpack');

module.exports = {
    module: {
        noParse: [/node_modules\/sinon\//],

        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint',
            },
        ],

        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ],
    },

    resolve: {
        alias: {
            sinon: 'sinon/pkg/sinon',
        },
    },

    babel: {
        presets: ['es2015', 'stage-2'],
        plugins: [
            ['istanbul', { exclude: ['test/**/*.js'] }],
            'transform-runtime',
        ],
    },

    eslint: {
        rules: {
            'one-var': 0,
            'one-var-declaration-per-line': 0,
            'no-unused-expressions': 0,
            'arrow-body-style': 0,
        },
    },
};
