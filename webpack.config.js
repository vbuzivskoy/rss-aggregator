const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

const getFilename = (extension) => (
  isDev ? `[name].${extension}` : `[name].[hash].${extension}`
);

module.exports = {
  mode: NODE_ENV,
  context: PATHS.src,
  entry: {
    main: ['@babel/polyfill', './index'],
  },
  output: {
    filename: getFilename('js'),
    path: PATHS.dist,
  },
  devServer: {
    contentBase: PATHS.dist,
    compress: true,
    port: 9000,
  },
  devtool: isDev ? 'source-map' : '',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: getFilename('css'),
    }),
    new CleanWebpackPlugin(),
    // new PurgecssPlugin({
    //   paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    // }),
  ],
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
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
