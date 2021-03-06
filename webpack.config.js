var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractStyles = new ExtractTextPlugin({
  filename: "h5p-curious-reader.css"
});

var config = {
  entry: {
    dist: './src/entries/dist.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'h5p-curious-reader.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src'),
        use: extractStyles.extract({
          use: ["css-loader?sourceMap", "resolve-url-loader"],
          fallback: "style-loader"
        }),
      },
      {
        test: /\.scss$/,
        use: extractStyles.extract({
          use: ["css-loader?sourceMap", "sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true"],
          fallback: "style-loader"
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        include: path.join(__dirname, 'src/fonts'),
        loader: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  },
  plugins: [extractStyles]
};

if(isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
