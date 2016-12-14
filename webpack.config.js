"use strict";

const webpack = require('webpack');

module.exports = {
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint',
            },
        ],

        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ],
    },

    babel: {
        presets: ['es2015', 'stage-2'],
        plugins: ['transform-runtime'],
    },

    devtool: '#source-map',
};
