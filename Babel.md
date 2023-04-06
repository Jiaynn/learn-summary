## Babel

Babel是一个js的编译器

### 基本知识

#### Plugin和Preset

Preset是一组插件的集合

插件分为语法插件和转译插件

**语法插件** 在解析这一步就使得 babel 能够解析更多的语法

**转译插件** 在转换这一步把源码转换并输出

babel-preset-env

`@babel/preset-env`是一个智能预设，它可以将我们的高版本`JavaScript`代码进行转译根据内置的规则转译成为低版本的`javascript`代码。

常见的插件：

babel-core：核心库，将源代码转换成ast语法树，然后再此语法树上进行转换后再生成新的代码

`babel-core`其实相当于`@babel/parse`和`@babel/generator`这两个包的合体

polyfill

`babel-prest-env`仅仅只会转化最新的`es`语法，并不会转化对应的`Api`和实例方法,比如说`ES 6`中的`Array.from`静态方法。如果想在低版本浏览器中识别并且运行`Array.from`方法达到我们的预期就需要额外引入`polyfill`进行在`Array`上添加实现这个方法。

有两种方法可以实现

方案一：`@babel/preset-env + @babel/polyfill`

方案二：`@babel/preset-env + @babel/plugin-transform-runtime + @babel/runtime-corejs2`

@babel/polyfill已被废弃，主要原因是没有平滑的支持core-js2——>core-js3的升级

@babel/polyfill本质是两个包的合集

core-js

regenerator-runtime/runtime  （用来转译genrator/async-await）

core-js@3 特性概览

- 支持ECMAScript稳定功能，引入core-js@3冻结期间的新功能，比如flat
- 加入到ES2016-ES2019中的提案，现在已经被标记为稳定功能
- **更新了提案的实现，增加了proposals配置项，由于提案阶段不稳定，需要谨慎使用**
- **增加了对一些web标准的支持，比如URL 和 URLSearchParams**
- **现在支持原型方法，同时不污染原型**
- 删除了过时的特性

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false, // 对ES6的模块文件不做转化，以便使用tree shaking、sideEffects等
        "useBuiltIns": "entry", // browserslist环境不支持的所有垫片都导入
    
        "corejs": {
          "version": 3, // 使用core-js@3
          "proposals": true,
        }
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
        {
          "corejs": false // 解决 helper 函数重复引入
        }
    ]
  ]
}
```

```js
在入口文件引入这些模块
import "core-js/stable";
import "regenerator-runtime/runtime";
```



#### `@babel/runtime`更像是一种**按需加载的解决方案**

- `babel-runtime`无法做到智能化分析，需要我们手动引入。
- `babel-runtime`编译过程中会重复生成冗余代码。

##### `@babel/plugin-transform-runtime`

`@babel/plugin-transform-runtime`插件会智能化的分析我们的项目中所使用到需要转译的`js`代码，从而实现模块化从`babel-runtime`中引入所需的`polyfill`实现

`@babel/plugin-transform-runtime`插件提供了一个`helpers`参数。这个`helpers`参数开启后可以将上边提到编译阶段重复的工具函数，比如`classCallCheck, extends`等代码转化称为`require`语句。