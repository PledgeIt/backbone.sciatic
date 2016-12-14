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

    eslint: {
        rules: {
            'one-var': 0,
            'one-var-declaration-per-line': 0,
            'no-unused-expressions': 0,
            'arrow-body-style': 0,
        },
    },
};
