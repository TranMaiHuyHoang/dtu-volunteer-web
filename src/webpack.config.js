// // webpack.config.js
// export {
//  entry: './src/index.js', // Entry point of your application
//  output: {
//    filename: 'bundle.js',
//    path: __dirname + '/dist',
//  },
//  module: {
//    rules: [
//      {
//        test: /\.js$/, // Apply this rule to JavaScript files
//        exclude: /node_modules/,
//        use: {
//          loader: 'babel-loader', // Transpile ES6+ code
//          options: {
//            presets: ['@babel/preset-env'],
//            sourceType: 'unambiguous', // Support both CommonJS and ES Modules
//          },
//        },
//      },
//    ],
//  },
//  resolve: {
//    extensions: ['.js'], // Resolve .js files by default
//  },
// };