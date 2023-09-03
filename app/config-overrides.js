const webpack = require("webpack");

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        crypto:  require.resolve("crypto-browserify"), // can be polyfilled here if needed
        buffer: require.resolve('buffer'),
        stream: require.resolve("stream-browserify") , // require.resolve("stream-browserify") can be polyfilled here if needed
        assert: require.resolve('assert'), // require.resolve("assert") can be polyfilled here if needed
        http: require.resolve("stream-http") , // require.resolve("stream-http") can be polyfilled here if needed
        https:  require.resolve("https-browserify"), // require.resolve("https-browserify") can be polyfilled here if needed
        os: false, // require.resolve("os-browserify") can be polyfilled here if needed
        url: require.resolve('url/'), // require.resolve("url") can be polyfilled here if needed
        zlib: require.resolve("browserify-zlib") , // require.resolve("browserify-zlib") can be polyfilled here if needed
      });
      config.resolve.fallback = fallback;
      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ]);
    config.module.rules.push({
        test: /\.(png|jpg|gif)$/,
        loader: require.resolve("file-loader"),
    },{
        test: /\.m?[jt]sx?$/,
        enforce: 'pre',
        use: ['source-map-loader'],
    },
    {
        test: /\.m?[jt]sx?$/,
        resolve: {
            fullySpecified: false,
        },
    },);
    return config;
}