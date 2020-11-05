const path = require('path');
module.exports = {
  entry: './src/index.ts',
  devtool: 'eval-source-map',
  output: {
    filename: 'ion-sdk.min.js',
    library: 'IonSDK',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
};
