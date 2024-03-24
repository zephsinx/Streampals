import path from "path";
import url from "url";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import PugPlugin from "pug-plugin";
import pageData from "./src/streamworms/views/pageData.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    entry: {
        index: './src/streamworms/views/streamworms.pug?pageData=' + JSON.stringify(pageData)
    },
    devtool: 'source-map',
    optimization: {
        moduleIds: 'deterministic',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {from: "./src/streamworms/media", to: "./media"},
                {from: "./src/streamworms/js/resources", to: "./js/resources"},
                {from: "./src/streamworms/favicon.ico", to: "./"},
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

export default config;