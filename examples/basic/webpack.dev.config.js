const webpack = require('webpack');
const path = require('path');
const WebpackDevServerOutput = require('webpack-dev-server-output');

module.exports = {
  entry: "../../src/connector/index.ts",
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'build'),
    library: 'Ion',
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        exclude: /node_modules/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [
    new WebpackDevServerOutput({
      path: 'build',
      isDel: true | false
    }),
  ]
};
