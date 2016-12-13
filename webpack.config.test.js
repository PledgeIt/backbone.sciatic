"use strict";

const webpack = require('webpack');
const path = require('path');

module.exports = {
    module: {
        noParse: [/node_modules\/sinon\//],

        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                enforce: 'pre',
                loader: 'eslint-loader',
                options: {
                   rules: {
                       'one-var': 0,
                       'one-var-declaration-per-line': 0,
                       'no-unused-expressions': 0,
                       'arrow-body-style': 0,
                   },
               },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['es2015', { "modules": false }],
                        'stage-2',
                    ],
                    plugins: [
                        ['istanbul', { exclude: ['test/**/*.js'] }],
                        'transform-runtime',
                    ],
                },
            },
        ],
    },

    resolve: {
        alias: {
            sinon: 'sinon/pkg/sinon',
        },
    },

    devtool: '#source-map',
};
