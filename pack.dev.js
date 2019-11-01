const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "src/app/main.ts"),
    output: {
      path: path.join(__dirname, "dist"),
      filename: "js/bundle.js"
    },
    resolve: {
        plugins: [],
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, "node_modules/phaser-ce/pixi.js/dist/pixi.min.js"),
        }
    },
    plugins: [
        new CleanWebpackPlugin([
          path.join(__dirname, "dist")
        ]),
        new CopyWebpackPlugin([
          { from: "assets/", to: "assets/" },
        ]),
        new HtmlWebpackPlugin({
          title: "RohTahSie",
          template: path.join(__dirname, "templates/index.ejs")
        }),
        new BrowserSyncPlugin({
          host: process.env.IP || 'localhost',
          port: process.env.PORT || 3000,
          server: {
            baseDir: ['./', './dist']
          }
        })
        // , new BundleAnalyzerPlugin()
      ],
    module: {
        rules: [
            { 
                test: /\.ts$/, 
                loaders: ['ts-loader'],
                exclude: "/node_modules/",
            }
        ]
    },
    devtool: "source-map"
}
