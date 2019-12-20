const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "src/app/main.ts"),
    output: {
      path: path.join(__dirname, "dist"),
      filename: "js/bundle.js"
    },
    resolve: {
      plugins: [],
      extensions: ['.ts', '.js']
    },
    plugins: [
      new webpack.ProvidePlugin({
        PIXI: 'pixi.js'
      }),
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
