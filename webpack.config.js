const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = {
    entry: './src/streamerworm/streamerworm.js',
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        moduleIds: 'deterministic',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./src/streamerworm/media", to: "./media" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: 'src/streamerworm/views/index.pug',
            favicon: './src/streamerworm/resources/favicon.ico',
            filename: 'index.pug',
            title: 'StreamerWorm',
            minify: false,
        }),
        new HtmlWebpackPugPlugin(),
    ],
    output: {
        filename: 'js/[name].[contenthash:8].js',
        path: path.resolve(__dirname, 'dist'),
    },
};