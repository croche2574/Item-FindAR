const path = require('path')

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require("terser-webpack-plugin");
const WebpackPwaManifest = require('webpack-pwa-manifest')
const { GenerateSW } = require("workbox-webpack-plugin");
const fs = require('fs');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const genRanHex = (size = 24) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

module.exports = {
  mode: 'development',
  entry: {
    'app': './src/index.jsx',
  },
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
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/inline'
      },
      {
        test: /\.(glb|gltf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'models/[hash][ext][query]'
        }
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
    new WebpackPwaManifest({
      name: 'Item FindAR',
      short_name: 'FindAR',
      description: 'An App for finding and identifying food products while shopping',
      background_color: '#848484',
      theme_color: '#1976d2',
      orientation: 'portrait',
      icons: [
        {
          src: path.resolve('src/assets/icon.png'),
          sizes: [384, 512], // multiple sizes
          destination: path.join('icons', 'android'),
        },
        {
          src: path.resolve('src/assets/large-icon.png'),
          size: '1024x1024', // you can also use the specifications pattern
          destination: path.join('icons', 'android'),
        },
        {
          src: path.resolve('src/assets/maskable-icon.png'),
          size: '1024x1024',
          purpose: 'maskable',
          destination: path.join('icons', 'android'),
        }
      ]
    }),
    new GenerateSW({
      swDest: "sw.js",
      maximumFileSizeToCacheInBytes: 10000000,
      additionalManifestEntries: [
        {
          "url": "/offline",
          "revision": genRanHex()
        }
      ],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/([\w+\.\-]+www\.itemfindar\.net)(|\/.*)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'core',
            precacheFallback: {
              fallbackURL: '/offline' // THIS IS THE KEY
            }
          }
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./assets/models", to: "./assets/models", noErrorOnMissing: true }]
    }),
    new BundleAnalyzerPlugin(),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
    clean: true,
  },
  devServer: {
    allowedHosts: 'any',
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

/**
alias: {
      three$: path.resolve("./build/three-exports.js"),
    },
*/