const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.config.js');
const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin').default;

module.exports = merge(common, {
  devtool: 'source-map',
  mode: 'production',
  // mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new WebpackDeepScopeAnalysisPlugin(),
  ],
  optimization: {
    usedExports: true,
    // minimize: false,
    sideEffects: false,
  }
});
