const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const isDevelopment = mode === 'development';

module.exports = {
  mode,
  output: {
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  target: isDevelopment ? 'web' : 'browserslist',
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
    }),
  ].concat(isDevelopment ? [] : [new MiniCssExtractPlugin()]),
};
