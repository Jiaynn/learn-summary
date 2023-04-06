### Node.js

REPL 在终端中编写js代码

_表示上次执行后返回的结果

按两下tab键可以看到在node中所有可以使用的全局变量

String. 后再按下tab键，可以看到String上所有可以使用的方法

#### 在node.js中使用ESModule开发

只需要在package.json中添加"type": "module"

### 内置模块

#### fs模块

```js
const fs=require('fs')
//创建目录
fs.mkdir('./file',(err)=>{
    console.log(err)
})
//重命名目录
fs.rename('./file','./files',(err)=>{
    console.log(err)
})
//删除目录 适用于文件夹下没有文件的情况，如果里面有文件，通过unlink方法将里面的文件删除后，在通过rmdir删除目录
fs.rmdir('./file',(err)=>{
    console.log(err)
})
//读目录
fs.readdir('./file',(err,data)=>{
    if(!err){
        consloe.log(data)
    }
})
//查看目录的详细信息
fs.stat('./file/a.txt',(err,data)=>{
    console.log(daat.isFile())
    console.log(data.isDirectory( ))
})
```

同步读取/写入文件

```JS
const fs=require('fs')
const text=fs.readFileSync('./file/text.txt','utf-8')
console.log(text)
//写入文件
fs.writeFileSync('./file/output.txt',text)
```

 同步会导致的问题

当我们读取一个很大的文件的时候或者操作缓慢的时候，每一行都会阻塞执行，只有当这行执行完成之后才能执行下一行

在node.js中执行阻塞代码会带来的问题

如果有很多的用户在访问这个程序，node.js是单线程的，意思就是说，所有的用户都是访问同一个线程，如果第一个用户读取了一个很大的文件，花费了很长的时候，这个时候后面的用户要干的事就不能执行，要等到第一个用户读取文件完成后才会执行

所有node.js通过执行异步非阻塞代码来解决这个问题

```js
//异步
fs.readFile("./file/text.txt", "utf-8", (err, data) => {
  console.log(data);
});
console.log("will read file");
//如果第一次写入文件，就将内容写入到文件中，而第二次写入相同的文件，就会覆盖上一次写的内容
fs.writeFile('./file/a.txt','hello world',(err)=>{
    console.log(err)
})
//追加文件,会在原文件有内容的情况下追加内容
fs.appendFile('./file/a.txt','hello world',(err)=>{
    consloe.log(err)
})
//删除文件
fs.unlink('./file/a.txt',err=>{
    console.log(err)
})
```

**删除一个里面嵌套文件的目录**

```js
const fs = require("fs").promises;
fs.readdir("./file").then(async (data) => {
  await Promise.all(data.map((item) => fs.unlink(`./file/${item}`)));
  await fs.rmdir("./file");
});
```

```js
//异步删除一个文件夹
const fs = require("fs");
const path = require("path");
function rmdirp(dir) {
  return new Promise((resolve, reject) => {
    fs.stat(dir, (err, data) => {
      if (!data.isFile()) {
        //是文件夹
        fs.readdir(dir, (err, file) => {
          let res = file.map((item) => rmdirp(path.join(dir, item)));
          Promise.all(res).then(() => {
            //当所有的子文件都删除后就删除当前文件夹
            fs.rmdir(dir, resolve);
          });
        });
      } else {
        fs.unlink(dir, resolve);
      }
    });
  });
}
rmdirp("./file");
```

#### stream流模块

读大文件或写入大文件的时候，我们就可以采取stream流模块

data事件表示流的数据已经可以读取了，end事件表示这个流已经到末尾了，没有数据可读了

```js
const fs = require("fs");
const rs = fs.createReadStream("./file/a.txt", "utf-8");
const ws = fs.createWriteStream("./file/2.txt", "utf-8");
rs.pipe(ws);
// rs.on("data", (chunk) => {
//   console.log(chunk);
//   ws.write(chunk);
// });
// rs.on("end", () => {
//   console.log("end");
//   ws.end();
// });
// rs.on("error", (err) => {
//   console.log(err);
// });
```



#### http模块

```js
//第一种写法
//根据传入的url来判断返回的内容
import http from "http";
http
  .createServer((req, res) => {
    res.writeHead(renderStatus(req.url), {
      "Content-Type": "text/html; charset=utf-8",
    });
    //接收浏览器传的参数，返回渲染的内容
    //可以解析html标签
    res.write(renderHTML(req.url));
    res.end();
  })
  .listen(3001, () => {
    console.log("server listen");
  });
function renderStatus(url) {
  let arr = ["/home", "list"];
  return arr.includes(url) ? 200 : 404;
}
function renderHTML(url) {
  switch (url) {
    case "/home":
      return "<div>home页面</div>";
    case "/about":
      return "<div>about页面</div>";
    default:
      return "<div>not found</div>";
  }
}
```

```js
import http from 'http'
const server=http.creatServer()
server.on('request',(req,res)=>{
     res.writeHead(renderStatus(req.url), {
      "Content-Type": "text/html; charset=utf-8",
    });
    //接收浏览器传的参数，返回渲染的内容
    //可以解析html标签
    res.write(renderHTML(req.url));
    res.end();
})
server.listen(3001,()=>{
    console.log('server running at http://127.0.0.1:3001')
})
```

如果传入的url路径带有参数的话，上面的方法就不适用了，所以我们需要用到url模块去解析路径



#### url模块

**旧版API**

**parse**

```js
//url的parse
url.parse(req.url)
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: '?name=ljy&age=20',
  query: 'name=ljy&age=20',
  pathname: '/home',
  path: '/home?name=ljy&age=20',
  href: '/home?name=ljy&age=20'
}
//如果解析的第二个参数为true的话，query参数会被解析成json对象格式
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: '?name=ljy&age=20',
  query: [Object: null prototype] { name: 'ljy', age: '20' },
  pathname: '/home',
  path: '/home?name=ljy&age=20',
  href: '/home?name=ljy&age=20'
}
```

**fromat**

```js
//与parse相反，将拆分的路径转换成一个完整的url路径
```

**reslove**

```js
//拼接路径
const url=require('url')
let a=url.reslove('/one/two','three')  //   /one/three
let b=url.reslove('one/two/','three')  //   /one/two/three
let c=url.reslove('http://www.baidu.com/one ','two')  //http://www.baidu.com/two
```

**新版API**

```js
const myURL = new URL(req.url, "http://127.0.0.1:3001");

URL {
  href: 'http://127.0.0.1:3001/home?name=ljy&age=20',
  origin: 'http://127.0.0.1:3001',
  protocol: 'http:',
  username: '',
  password: '',
  host: '127.0.0.1:3001',
  hostname: '127.0.0.1',
  port: '3001',
  pathname: '/home',
  search: '?name=ljy&age=20',
  searchParams: URLSearchParams { 'name' => 'ljy', 'age' => '20' },        
  hash: ''
}
//获取参数
//URLSearchParams { 'name' => 'ljy', 'age' => '20' }
    for (let [key, value] of myURL.searchParams) {
      console.log(key, value);
    }
// name ljy
//age   20
```

```js
let b=new URL('/one','http://www.baidu.com/aaa)
//b.href为拼接后的url
  URL {
  href: 'http://www.baidu.com/one',
  origin: 'http://www.baidu.com',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'www.baidu.com',
  hostname: 'www.baidu.com',
  port: '',
  pathname: '/one',
  search: '',
  searchParams: URLSearchParams {},
  hash: ''
}
```

**url.fileURLToPath(url)**

```js
new URL('file:///C:/path/').pathname //错误：/C:path/
fileURLToPath('file:///C:/path/')    //正确： C:\path\ (windows)

new URL('file://nas/foo.txt').pathname;    // Incorrect: /foo.txt
fileURLToPath('file://nas/foo.txt');       // Correct:   \\nas\foo.txt (Windows)

new URL('file:///你好.txt').pathname;      // Incorrect: /%E4%BD%A0%E5%A5%BD.txt
fileURLToPath('file:///你好.txt');         // Correct:   /你好.txt (POSIX)

new URL('file:///hello world').pathname;   // Incorrect: /hello%20world
fileURLToPath('file:///hello world');      // Correct:   /hello world (POSIX)
```

#### queryString模块

```js
let querystring=require('querystring')
let str = "name=lijiayan&age=20";
//这两种写法一样
let obj = querystring.decode(str);
let obj=querystring.parse(str);
console.log(obj);
//[Object: null prototype] { name: 'lijiayan', age: '20' }
let obj1=querystring.encode(obj)
let obj1=querystring.stringfy(obj)
console.log(obj1)
//name=lijiayan&age=20
```

```js
//转义
let str1 = "id=1&city=重庆&url=http://www.baidu.com";
let escaped = querystring.escape(str1);
console.log(escaped);
//id%3D1%26city%3D%E9%87%8D%E5%BA%86%26url%3Dhttp%3A%2F%2Fwww.baidu.com

```

#### Event模块

```js
// const EventEmitter = require("events");
// const event = new EventEmitter();
// event.on("play", (movie) => {
//   console.log(movie);
// });
// event.emit("play", "hhhhhh");
let http = require("http");
//slet https = require("https");
let url = require("url");
let EventEmitter = require("events");
let event = null;
http
  .createServer((req, res) => {
    let urlobj = url.parse(req.url, true);
    // console.log(urlobj);
    res.writeHead(200, {
      "access-control-allow-origin": "*",
    });
    switch (urlobj.pathname) {
      case "/info":
        //充当客户端，像猫眼要数据
        httpget();
        event = new EventEmitter();
        event.on("ready", (data) => {
          res.end(data);
        });
        break;
      default:
        res.end("404");
    }
  })
  .listen(3001, () => {
    console.log("server listen");
  });
function httpget() {
  let data = "";
  http.get(
    `http://i.maoyan.com/api/mmdb/movie/v3/list/hot.json?ct=%E5%8C%97%E4%BA%AC&ci=1&channelId=4`,
    (res) => {
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        event.emit("ready", data);
      });
    }
  );
}

```

#### zlib模块

```js
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const gzip = zlib.createGzip();
http
  .createServer((req, res) => {
    const readStream = fs.createReadStream("./index.js");
    res.writeHead(200, {
      "Content-Type": "application/x-javascript;charset=utf-8",
      "Content-Encoding": "gzip",
    });
    readStream.pipe(gzip).pipe(res);
  })
  .listen(3001, () => {
    console.log("server listen");
  });

```

#### crypto模块

md5可用于密码的保存和文件完整性的校验

```js
const crypto = require("crypto");
const hash = crypto.createHash("md5");
const hash1 = crypto.createHash("sha1");
hash1.update("hello world");
hash.update("hello world");
console.log(hash1.digest("hex"));
console.log(hash.digest("hex"));
//Hmac算法 他可以利用MD5或sha1算法，不同的是，Hmac还需要一个密钥
//只要密钥发生变化，那么同样的输入数据也会得到不同的签名
const hmac = crypto.createHmac("sha256", "secret-key");
hmac.update("hello world");
console.log(hmac.digest("hex"));
//AES对称加密算法 加解密都用同一个密钥
function encrypt(key, iv,data) {
  var cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  var crypted = cipher.update(data, "utf8", "binary");
  crypted += cipher.final("binary");
  //buffer.from 创建包含指定字符串，数组或缓冲区的新缓冲区。
  crypted = new Buffer.from(crypted, "binary").toString("base64");
  return crypted;
}
var decrypt = function (key, iv, crypted) {
  crypted = new Buffer.from(crypted, "base64").toString("binary");
  var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  var decoded = decipher.update(crypted, "binary", "utf8");
  decoded += decipher.final("utf8");
  return decoded;
};
var key = "751f621ea5c8f930";
console.log("加密的key:", key.toString("hex"));
var iv = "2624750004598718";
console.log("加密的iv:", iv);
var data = "Hello, nodejs. 演示aes-128-cbc加密和解密";
console.log("需要加密的数据:", data);
var crypted = encrypt(key, iv, data);
console.log("数据加密后:", crypted);
var dec = decrypt(key, iv, crypted);
console.log("数据解密后:", dec);
function decrypt() {}
```

### 跨域

**jsonp**

```js
//返回一个与前端约定好的函数，里面是返回的内容
let http = require("http");
let url = require("url");
http
  .createServer((req, res) => {
    let urlobj = url.parse(req.url, true);
    console.log(urlobj);
    switch (urlobj.pathname) {
      case "/info":
        res.end(
          `
            ${urlobj.query.callback}(${JSON.stringify({
            name: "lijiayan",
            age: 20,
          })})
        `
        );
        break;
      default:
        res.end("404");
    }
  })
  .listen(3001, () => {
    console.log("server listen");
  });
```

**cors解决跨域**

只需要在返回的响应头加一句就可以

```js
 res.writeHead(200, {
      "access-control-allow-origin": "*",
    });
```

Node也可以作为一个中间层

![](D:\Web\自己总结的学习记录\md图片\node.png)

**http模块-get**

```js
let http = require("http");
//slet https = require("https");
let url = require("url");
http
  .createServer((req, res) => {
    let urlobj = url.parse(req.url, true);
    // console.log(urlobj);
    res.writeHead(200, {
      "access-control-allow-origin": "*",
    });
    switch (urlobj.pathname) {
      case "/info":
        //充当客户端，像猫眼要数据
        httpget((data)=>{
            res.end(data)
        });
        break;
      default:
        res.end("404");
    }
  })
  .listen(3001, () => {
    console.log("server listen");
  });
function httpget(callback) {
  let data = "";
  http.get(
    `http://i.maoyan.com/api/mmdb/movie/v3/list/hot.json?ct=%E5%8C%97%E4%BA%AC&ci=1&channelId=4`,
    (res) => {
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
       callback(data)
      });
    }
  );
}

```

```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script>
        fetch("http://localhost:3001/info").then((res) => res.json()).then(res => {
            console.log(res);
        })
    </script>

</body>

</html>
```

**http模块-post请求**

```js
let http = require("http");
let https = require("https");
let url = require("url");
http
  .createServer((req, res) => {
    let urlobj = url.parse(req.url, true);
    res.writeHead(200, {
      "access-control-allow-origin": "*",
    });
    switch (urlobj.pathname) {
      case "/info":
        //充当客户端，像猫眼要数据
        httppost((data) => {
          res.end(data);
        });
        break;
      default:
        res.end("404");
    }
  })
  .listen(3001, () => {
    console.log("server listen");
  });
function httppost(callback) {
  let data = "";
  let options = {
    hostname: "m.xiaomiyoupin.com",
    port: "443",
    path: "/mtop/market/search/placeHolder",
    method: "post",
    headers: {
      "Content-Type": "application/json",
        //"Content-Type":"x-www-form-urlencoded"
    },
  };
  let req = https.request(options, (res) => {
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      callback(data);
    });
  });
    //req.write("name=lijiayan&age=20")
  req.write(JSON.stringify([{}, { baseParam: { ypClient: 1 } }]));
  req.end();
}
```

### Express

基本使用

```js
const express = require("express");
const app = express();
app.get("/", (req, res) => {
    //可以直接返回代码片段，json字符串，可以不用谢响应头
  res.send({
    name: "lijiayan",
    age: 20,
  });
});
app.listen(3001, () => {
  console.log("server listen");
});
```

路径请求的匹配，他里面可以是字符串、字符串模式或者正则表达式

```js
const express = require("express");
const app = express();
app.get("/", (req, res) => {
  //可以直接返回代码片段，json字符串，可以不用谢响应头
  res.send({
    name: "lijiayan",
    age: 20,
  });
});
//使用字符串模式的路由路径
//可匹配acd abcd
app.get("/ab?cd", (req, res) => {
  res.send("ab?cd");
});
// //匹配/ab/****
app.get("/ab/:id", (req, res) => {
  res.send("aaa");
});
// //匹配abcd abbcd abbbcd
app.get("/ab+cd", (req, res) => {
  res.send("ab+cd");
});
// //匹配abcd abeejd  abhjekrd
app.get("/ab*d", (req, res) => {
  res.send("ab*d");
});
app.get("/ab(cd)?e", (req, res) => {
  res.send("ab(cd)?e");
});
//正则
//匹配任何路径中含有a的路径
app.get(/a/, (req, res) => {
  res.send("/a/");
});
//匹配以fly结尾的
app.get(/.*fly$/, (req, res) => {
  res.send("/.*fly$/");
});
app.listen(3001, () => {
  console.log("server listen");
});
```

express的回调函数也成为中间件

中间件之间传递参数可以通过在res上挂载属性然后使用

```js
const express = require("express");
const app = express();
//回调函数也成为中间件
//在返回之前处理一些逻辑，比如验证token之类的、查询数据库等
app.get(
  "/home",
  (req, res, next) => {
    let isValid = false;
    if (isValid) {
      next();
    } else {
      res.send("error");
    }
  },
  (req, res) => {
    res.send({
      list: [1, 2, 3],
    });
  }
);
//使用回调函数数组处理路由
let fun1 = function (req, res, next) {
  res.lijiayan = "xxxxs";
  console.log("fun1");
  next();
};
let fun2 = function (req, res) {
  console.log("fun1计算的结果", res.lijiayan);
  res.send("hhhhh");
};
app.get("/about", [fun1, fun2]);
app.listen(3001, () => {
  console.log("server listen");
});

```

#### 中间件

##### 应用级别中间件

- 通过 `app.use()` 或 `app.get()` 或 `app.post()` ，绑定到 `app` 实例上的中间件

 挂载到app上，在他之后注册的路由都需要先经过这个中间件的预处理

```js
//没有挂在路径的中间件
app.use(function(req,res,next){
    consloe.log('xxx')
    next()
})
//挂载路径的中间件
app.use('/home',function(req,res,next){
    
})
```

##### 路由级别中间件

- 绑定到 `express.Router()` 实例上的中间件，叫做路由级别的中间件。用法和应用级别中间件没有区别。应用级别中间件是绑定到 `app` 实例上，路由级别中间件绑定到 `router` 实例上。

```js
const express = require("express");
const router = express.Router();
router.use((req, res, next) => {
  console.log("第二个中间件");
  next();
});
router.get("/home", (req, res) => {
  res.send("home");
});
router.get("about", (req, res) => {
  res.send("about");
});
module.exports = router;

```

挂载到app上

```js
const express = require("express");
const router = require("./apiRouter");
const app = express();
app.use((req, res, next) => {
  console.log("全局中间件");
  next();
});
app.use("/api", router);
app.listen(3001, () => {
  console.log("server listen");
});

```

##### 错误级别中间件

- 用来捕获整个项目中发生的异常错误，从而防止项目异常崩溃的问题
- 错误级别中间件的处理函数中，必须有 4 个形参，形参顺序从前到后分别是 `(err, req, res, next)` 。
- 错误级别的中间件必须注册在所有路由之后

```js
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  throw new Error('服务器内部发生了错误！')
  res.send('Home page.')
})

// 定义错误级别的中间件，捕获整个项目的异常错误，从而防止程序的崩溃
app.use((err, req, res, next) => {
  console.log('发生了错误！' + err.message)
  res.send('Error：' + err.message)
})

app.listen(80, function () {
  console.log('Express server running at http://127.0.0.1')
})
```

##### 内置的中间件

- `express.static` 快速托管静态资源的内置中间件，例如： HTML 文件、图片、CSS 样式等（无兼容性）
- `express.json` 解析 JSON 格式的请求体数据（有兼容性，仅在 4.16.0+ 版本中可用）
- `express.urlencoded` 解析 URL-encoded 格式的请求体数据（有兼容性，仅在 4.16.0+ 版本中可用）

**express.json()**

```js
const express = require("express");
const app = express();
app.use(express.json());
app.post("/info", (req, res) => {
  //在服务器可以使用req.body属性来接受客户端发送过来的请求体数据
  //默认情况下，如果没有配置解析表单数据的中间件，req.body默认等于undefined
  console.log(req.body);
  res.send("success");
});
app.listen(3001, () => {
  console.log("server listen");
});
```

**express.urlencoded**

```js
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended：false}));
app.post("/home", (req, res) => {
    //在服务器可以使用req.body属性来接受客户端发送过来的请求体数据,可以是json格式和url-encoded格式
  console.log(req.body);
  res.send("home");
});
app.listen(3001, () => {
  console.log("server listen");
});
```

可以通过req.query()获取get参数

**express.static**

通过express.static()可以非常方便的创建一个静态资源服务器

```js
app.use(express.static('public'))
```

编写了这段代码后，我们就可以访问public目录下的所有文件了

```js
http://localhost:3000/images/bg.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/login.js
```

如果要托管多个静态资源目录，多次调用express.static()函数即可

```js
app.use(express.static('public'))
app.use(express.static('files'))
```

访问静态文件时，express.static()函数会根据目录添加的顺序去查找所需的文件

```js
app.use('/public', express.static('public'))
```



#### 前后端分离模式

为什么会出现前后端分离，在之前大多数都是使用服务端渲染，随着前端展示页面越来越复杂，使用原生的这些去编写web页面也变得越来越复杂，就会出现很多问题，所以解决的办法就是解耦==》前后端的内容分开来做

前后端分离：

- 前端编写静态页面，动态效果
- json模拟，ajax动态创建页面
- 真实数据接口，前后端联调

服务端渲染：

- 前端编写静态页面，动态效果
- 前端将写好的代码提供给后端，后端要把静态html以及里面的假数据删掉，通过模板进行动态生成html

分离：SPA  不分离：JSP

SPA：单页Web应用（Single-page application，SPA），只有一张Web页面的应用，是**加载单个HTML页面**并在用户与应用程序交互时**动态更新该页面**的web应用程序。

JSP：：（Java Server Pages，Java服务器页面），意思是基于JAVA服务器的网页技术，是一种动态网页开发技术，使用JSP标签在HTml网页中插入Java代码。跟asp，php一样，都是网页制作用的语言。

**JSP工作流程**

（1）客户端请求
（2）服务器的servlet或controller接受请求（路由规则由后端制定，整个项目开发的权重大部分在后端）
（3）调用service代码完成业务逻辑
（4）返回jsp
（5）jsp展现一些动态的代码

**SPA工作流程**

1.浏览器发送请求

2.直接到达html页面（路由规则由前端制定，整个项目开发的权重前移）

3.html页面负责调用服务端接口产生数据（通过ajax等等，后台返回json格式数据）

4.填充html，展现动态效果，在页面上进行解析并操作DOM。

#### 服务端渲染

需要在应用中进行如下设置才能让 Express 渲染模板文件：

- views, 放模板文件的目录，比如： app.set('views', './views')
- view engine, 模板引擎，比如： app.set('view engine', 'ejs')

<% %>流程控制标签(if else for)

<%= %> 输出标签（原文输出html标签）

<%- %> 输出标签（html会被解析输出）

<%# %>注释标签

<%- include('./header.ejs') 导入公共的模块内容

```js
//配置模板
app.set("views", "./views");
app.set("view engine", "ejs");
```

```js
const express = require("express");
const router = express.Router();
router.get("/", (req, res) => {
  //   res.send("login");
  res.render("login", { error: "" });
});
router.post("/", (req, res) => {
  if (req.body.username == "lijiayan" && req.body.password == "123456") {
    console.log("登录成功");
    res.redirect("/home");
  } else {
    console.log("登录失败");
    res.render("login", { error: "用户名密码不匹配" });
  }
});
module.exports = router;
```

如果想要不写ejs 而且访问的时候直接是/login 而不是/login.html

```js
//配置模板
app.set("views", "./views");
app.set("view engine", "html");
app.engin('html',require('ejs').renderFile)
```

#### express生成器

### Koa

```js
const koa = require("koa");
const app = new koa();
app.use((ctx) => {
  ctx.body = "hello koa";
});
app.listen(3000, () => {
  console.log("server is running in http://127.0.0.1:3000");
});
```

koa中间件

























### Serverless

![](D:\Web\自己总结的学习记录\md图片\serverless.png)

我们要部署一个应用，我们希望关注这个应用本身，而不是其运维

serverless特性

- hostless：不绑定一个具体主机的，serverless是基于云计算去推的一项技术标准，相当于就是云厂商可能由非常多的服务器，然后serverless这台应用跑在任何一台服务器上都可以
- Elastic（弹性）：当一个应用在承接流量的时候，如果遇到一波洪峰流量，可以快速扩容来承接这部分流量，如果流量比较少的时候，可以把容器或者函数给缩成一个或者零个，从而节约一个计算的开销和机器的成本
- Stateless（无状态）：在弹性的基础上就说明了一个容器他可能会被随时摧毁，如果这个容器或函数里面保存了用户登录状态，一旦这个函数被摧毁了，那么这个用户的登录状态也就丢失了
- Event-driven（事件驱动）：当我们需要去调用这个函数的时候，往往是由事件去触发的
- Lego Blocks：意思就是说可以像乐高一样进行组合
- 高可用：函数是具有高可用性的，不会因为什么流量洪峰或者流量低谷，会导致他的一个流量故障，他也是能正常运行的
- 按量付费

案例

Web应用

![](D:\Web\自己总结的学习记录\md图片\Snipaste_2022-09-21_21-17-49.png)

函数计算作为一个函数，他是可以连通后端服务的，它可以从表格存储里面拉到数据，去文件存储里面拉到文件，去日志函数里面去打日志，返回计算结果，给用户访问一个真正的web应用或web站点或提供一段数据

![](D:\Web\自己总结的学习记录\md图片\Snipaste_2022-09-21_21-25-33.png)

案例：视频转码

![](D:\Web\自己总结的学习记录\md图片\Snipaste_2022-09-21_21-26-37.png)

### 











