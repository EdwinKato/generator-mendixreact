var webpackConfig = require("./webpack.config");
Object.assign(webpackConfig, {
    debug: true,
    devtool: "inline-source-map"
});

webpackConfig.externals.push("react/lib/ExecutionEnvironment");
webpackConfig.externals.push("react/lib/ReactContext");
webpackConfig.externals.push("react/addons");
webpackConfig.externals.push("jsdom");

module.exports = function(config) {
    config.set({
        basePath: "",
        frameworks: [ "jasmine" ],
        files: [
            { pattern: "tests/**/*.ts", watched: false, included: false, served: false },
            { pattern: "src/**/*.ts", watched: false, included: false, served: false },
            "tests/test-index.js"
        ],
        exclude: [],
        preprocessors: {
            "tests/test-index.js": [ "webpack" ]
        },
        webpack: webpackConfig,
        webpackServer: { noInfo: true },
        reporters: [ "progress" ],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: [ "Chrome" ],
        singleRun: false,
        concurrency: Infinity
    })
};