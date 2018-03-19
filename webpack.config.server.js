const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    // 应用入口
    entry: {
        app: path.join(__dirname, './src/server-entry.js')  // app.js作为打包的入口
    },
    // 输出目录
    output: {
        filename: 'server-entry.js',  // node端没有浏览器缓存这个概念，并且需要在node中直接import这个文件。故直接命名就好
        path: path.join(__dirname, './dist'), // 打包好之后的输出路径
        publicPath: '',
        libraryTarget: 'commonjs2' // 打包出来js模块所使用的方案（umd、amd、cmd、commonJS）这里我们使用commonjs2，适用于node端
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true }
                    }
                ]
            }
        ]
    },
    target: 'node', //webpack打包出来的内容使用在什么环境下    
    optimization: {
        splitChunks: {
            chunks: "initial",         // 必须三选一： "initial" | "all"(默认就是all) | "async"
            minSize: 0,                // 最小尺寸，默认0
            minChunks: 1,              // 最小 chunk ，默认1
            maxAsyncRequests: 1,       // 最大异步请求数， 默认1
            maxInitialRequests: 1,    // 最大初始化请求书，默认1
            name: () => { },              // 名称，此选项课接收 function
            cacheGroups: {                 // 这里开始设置缓存的 chunks
                priority: "0",                // 缓存组优先级 false | object |
                vendor: {                   // key 为entry中定义的 入口名称
                    chunks: "initial",        // 必须三选一： "initial" | "all" | "async"(默认就是异步)
                    test: /react|lodash/,     // 正则规则验证，如果符合就提取 chunk
                    name: "vendor",           // 要缓存的 分隔出来的 chunk 名称
                    minSize: 0,
                    minChunks: 1,
                    enforce: true,
                    maxAsyncRequests: 1,       // 最大异步请求数， 默认1
                    maxInitialRequests: 1,    // 最大初始化请求书，默认1
                    reuseExistingChunk: true   // 可设置是否重用该chunk（查看源码没有发现默认值）
                }
            }
        }
    }
};