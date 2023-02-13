const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const PugPlugin = require('pug-plugin');

const config = {
    entry: {
        streamworms: './src/streamworms/views/streamworms.pug?pageData='
            + JSON.stringify({ title: 'StreamWorms', lang: 'en' })
    },
    devtool: 'source-map',
    optimization: {
        moduleIds: 'deterministic',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./src/streamworms/media", to: "./media" },
                { from: "./src/streamworms/js/resources", to: "./js/resources" },
                { from: "./src/streamworms/favicon.ico", to: "./" },
            ],
        }),
        // enable processing of Pug files defined in webpack entry
        new PugPlugin({
            js: {
                // output filename of extracted JS file from source script defined in Pug
                filename: 'js/[name].[contenthash:8].js'
            },
            favicon: {
                filename: 'favicon.ico'
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.pug$/,
                loader: PugPlugin.loader, // PugPlugin already contain the pug-loader
            }
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
};

module.exports = config;