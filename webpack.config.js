const path = require('path')

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|glb)$/i,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css", ".jpg"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Item FindAR',
      template: './src/index.html',
      inject: 'body'
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./assets/models", to: "./assets/models" }],
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    allowedHosts: [".loca.lt"],
    open: false,
    port: 8080,
    client: {
      webSocketURL: "ws://0.0.0.0/ws",
    },
    proxy: {
      "/ws": {
        target: "http://localhost:443",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        parallel: true,
      }),
    ],
  },
};