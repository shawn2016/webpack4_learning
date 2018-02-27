# webpack4_learning

### 安装

```
yarn add webpack -D
```

### 环境

不再支持 Node.js 4。

### 模块类型

webpack 4之前，js 是 webpack 中的唯一模块类型，因而不能有效地打包其它类型的文件。而 webpack 4 则提供了 5 种模块类型：

- `javascript/auto`: (webpack 3中的默认类型)支持所有的JS模块系统：CommonJS、AMD、ESM
- `javascript/esm`: EcmaScript 模块，在其他的模块系统中不可用（默认 `.mjs` 文件）
- `javascript/dynamic`: 仅支持 CommonJS & AMD，EcmaScript 模块不可用
- `json`: 可通过 `require` 和 `import` 导入的 JSON 格式的数据(默认为 `.json` 的文件)
- `webassembly/experimental`: WebAssembly 模块(处于试验阶段，默认为 `.wasm`的文件)

此外，webpack 4 中会默认解析 `.wasm`, `.mjs`, `.js` 和 `.json` 为后缀的文件。

<font color=red>在对应文件的 loader 配置，需要增加 `type` 字段来指定模块类型：</font> 

```
module: {
    rules: [{
        test: /\.special\.json$/,
        type: "javascript/auto",
        use: "special-loader"
    }]
 }
```

`javascript/auto` / `javascript/esm` 都可以处理 ESM， 但后者会更加严格：

- 导入的名称必须存在于导入的模块中
- 动态的模块（非 ESM，如 CommonJS）只能通过默认 `import` 导入，其它方式（包括命名空间）的导入都会报错

对于 WebAssembly 模块：

- 可以导入其它模块(JS 和 WASM)

- 试图在 WASM 模块中导入不存在的模块将会得到一个警告或者错误

- ESM 可以引入 WASM 模块中导出的模块名

- 仅可在 async chunks(通过 `import()` 导入的模块)中使用，在 initial chunks 中是无效的(不利于提升 web 应用的性能)

  ### `mode`: 模式配置

  <font color=red>`mode` 是 webpack 4 中新增加的参数选项，其有两个可选值：`production` 和 `development`。`mode` 不可缺省，需要二选一：</font >

  1. production模式：

  - 默认提供所有可能的优化，如代码压缩/作用域提升等

  - 不支持 `watching`

  - `process.env.NODE_ENV` 的值不需要再定义，默认是 `production`

    ```
    /** webpack.production.config.js **/
       // webpack 2/3 
       module.exports = {
           plugins: [
            new UglifyJsPlugin(/* ... */),
            new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
           ]
         }
         
       // webpack 4  
       module.exports = {
       	mode: 'production'
       }
    ```

    1. development 模式：

    - 主要优化了增量构建速度和开发体验
    - `process.env.NODE_ENV` 的值不需要再定义，默认是 `development`
    - 开发模式下支持注释和提示，并且支持 eval 下的 source maps

    ```
    /** webpack.development.config.js **/
       // webpack 2/3 
       module.exports = {
           plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") })
           ]
         }
         
       // webpack 4  
       module.exports = {
       	mode: 'development'
       }
    ```

    <font color=red>此外, webpack 4 还提供一种隐藏(`none`)模式，这种模式下会禁用一切优化</font>

    ### sideEffects 设置

    webpack 4 在 `package.json` 中引入了对 `sideEffects: false` 的支持。当模块的 `package.json` 中添加该字段时，表明该模块没有副作用，也就意味着 webpack 可以安全地清除被用于重复导出(re-exports)的代码。

    ### JSON

    webpack 4 不仅支持本地处理 JSON，还支持对 JSON 的 Tree Shaking。当使用 ESM 语法 `import` json 时，webpack 会消除掉JSON Module 中未使用的导出。

    此外，如果要用 loader 转换 json 为 js，需要设置 `type` 为 `javascript/auto`：

    ```
    module.rules: [
    	{
    	  test: /\.special\.json$/,
    	  type: "javascript/auto",
    	  use: "special-loader"
    	}
    ]
    ```

    ### 配置

    - 删除了一些常用内置插件：

      - NoEmitOnErrorsPlugin -> optimization.noEmitOnErrors (生产模式默认)
      - ModuleConcatenationPlugin -> optimization.concatenateModules （生产模式默认）
      - NamedModulesPlugin -> optimization.namedModules （开发模式默认）。
      - 删除了 CommonsChunkPlugin，取而代之的是 [`optimization.splitChunks`](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693) 和 [`optimization.runtimeChunk`](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693)，这提供了细粒度的缓存策略控制

    - 可以使用 `module.rules[].resolve` 来配置解析，它会与全局配置合并。

    - `optimization.minimize` 用于控制 minimizing 的开关。 生产模式默认为开，开发模式默认为关。

    - `optimization.minimizer` 用于配置 minimizers 和选项。

    - 许多支持占位符(placeholders)的配置选项现也支持函数形式

    - 错误的 `options.dependencies` 配置将报错

    - `sideEffects` 可以通过 `module.rules` 覆盖

    - `output.hashFunction` 可以是一个构造函数，用于自定义 hash 函数。处于性能考虑，也可以提供非加密哈希函数

    - `output.globalObject` 可以用于配置运行时的全局对象引用

    - 默认配置

      - webpack 默认会按照 `.wasm`, `.mjs`, `.js` 和 `.json` 的扩展名顺序查找模块。
      - `output.pathinfo` 在开发模式下默认是打开的
      - 生产环境下，默认关闭内存缓存
      - `entry` 的默认值是 `./src`，`output.path` 的默认值是 `./dist`
      - 在选择模式选项时，默认值是 `production`

      ### 优化

      - `uglifyjs-webpack-plugin` 发布 v1，支持 ES2015
      - 使用 JSONP 数组来代替 JSONP 函数 –> 异步支持
      - webpack 自身也可以删除无用代码。webpack 2/3 中是在 Uglify 时删除无用代码，webpack 4 中 webpack 也可以(在某些情况下)删除无用代码，避免 `import()` 引用无用代码时导致的奔溃
      - 作用域提升后的模块将生成更少的代码

      ### 性能

      - 默认情况，UglifyJS 会默认缓存和并行化(完全实现缓存和并行化将在 webpack 5 中实现)
      - 多个性能改进，尤其是在增量构建这方面
      - 改进了 `RemoveParentModluesPlugin` 的性能
      - 未使用模块不再有非必要的作用域提升
      - 添加 ProfilingPlugin，此插件会(在 Chrome 浏览器中)创建一个包含各插件时间消耗的文件
      - `for of` 代替 `forEach`；`Map/Set` 代替 `Objects`；`includes` 代替 `indexOf`
      - 同一个任务只会进入队列一次

      ### 移除的功能

      - 移除了 `module.loaders`
      - 移除了 `loaderContext.options`
      - 移除了 `Compilation.notCacheable`
      - 移除了 `NoErrorsPlugin`
      - 移除了 `Dependency.isEqualResource`
      - 移除了 `NewWatchingPlugin`
      - 移除了 `CommonsChunkPlugin`