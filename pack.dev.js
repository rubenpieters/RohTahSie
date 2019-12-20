const config = require("./pack.shared.js");

const BrowserSyncPlugin = require("browser-sync-webpack-plugin");

Object.assign(config, {
  plugins: config.plugins.concat([
    new BrowserSyncPlugin({
      host: process.env.IP || 'localhost',
      port: process.env.PORT || 3000,
      server: {
        baseDir: ['./', './dist']
      }
    }),
    // new BundleAnalyzerPlugin(),
  ]),
});

module.exports = config;