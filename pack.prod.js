const config = require("./pack.shared.js");

const webpack = require("webpack");

Object.assign(config, {
  plugins: config.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      drop_console: true,
      minimize: true,
      output: {
        comments: false
      },
    }),
  ]),
});

module.exports = config;