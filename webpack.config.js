const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = {
    entry: './src/streamworms/streamworms.js',
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        moduleIds: 'deterministic',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./src/streamworms/media", to: "./media" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: 'src/streamworms/views/index.pug',
            favicon: './src/streamworms/resources/favicon.ico',
            filename: 'index.pug',
            title: 'StreamWorms',
            minify: false,
        }),
        new HtmlWebpackPugPlugin(),
    ],
    output: {
        filename: 'js/[name].[contenthash:8].js',
        path: path.resolve(__dirname, 'dist'),
    },
};