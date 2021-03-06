const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const isDev = process.env.NODE_ENV === 'development'

const config = {
    // 应用入口
    entry: {
        app: path.join(__dirname, './src/app.js')  // app.js作为打包的入口
    },
    // 输出目录
    output: {
        filename: '[name].[hash].js',  //name代表entry对应的名字; hash代表 整个app打包完成后根据内容加上hash。一旦整个文件内容变更，hash就会变化
        path: path.join(__dirname, './dist'), // 打包好之后的输出路径
        publicPath: '/public' // 静态资源文件引用时的路径（加在引用静态资源前面的）
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
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html",
            inject:true
        })
    ],
};
if (isDev) {
    config.devServer = {
        host: '0.0.0.0',  // 我们可以允许我们用任意方式进行访问（127.0.0.1，localhost, 本机ip）
        port: '8888',
        contentBase: path.join(__dirname, './dist'),
        // hot: true,  //启动热加载
        overlay: {  // 错误提醒弹窗小遮层
            errors: true //只显示error
        },
        // 和output配置对应起来
        publicPath: '/public',  // 访问所有静态路径都要前面加/public才能访问生成的静态文件
        historyApiFallback: {
            index: '/public/index.html' // 所有404的请求全部访问该配置下的url
        }
    }
}
module.exports = config