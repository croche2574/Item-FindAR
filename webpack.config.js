const path = require('path')

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require("terser-webpack-plugin");
const fs = require('fs');

module.exports = {
  mode: 'development',
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
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
    extensions: [".tsx", ".ts", ".js", ".jsx", ".css", ".jpg"],
    fallback: {
      "fs": false,
      "path": false,
      "os": false
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Item FindAR',
      template: './src/index.html',
      inject: 'body'
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./assets/models", to: "./assets/models", noErrorOnMissing: true }]
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist"),
    clean: true,
  },
  devServer: {
    allowedHosts: 'all',
    open: false,
    port: 8080,
    client: {
      webSocketURL: "ws://0.0.0.0/ws",
    },
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync("cert.key"),
        cert: fs.readFileSync("cert.crt"),
        ca: fs.readFileSync("ca.crt"),
      },
    },
    static: {
      directory: path.join(__dirname, './')
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