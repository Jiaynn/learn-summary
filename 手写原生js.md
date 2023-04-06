### JavaScript的编码能力

掌握不扎实：深拷贝

#### 1.多种方式实现数组去重、扁平化、对比优缺点

**数组去重**

```js
  let arr=['a','b','a','c','d','b']
  //1.set()
  let res=new Set(arr)
  //2.循环遍历用includes筛选
  let newarr=[]
  for(let i=0;i<arr.length;i++){
      if(!newarr.includes(arr[i])){
          newarr.push(arr[i])
      }
  }
  console.log(newarr)
//3.循环遍历用indexOf筛选
let newarr=[]
for(let i=0;i<arr.length;i++){
    if(newarr.indexOf(arr[i]===-1)){
		newarr.push(arr[i])
    }
}
console.log(newarr)
//4.filter和indexOf
let newarr=arr.filter((item,index,self)=>{
    return self.indexOf(item)===index
})
console.log(newarr)
//5.sort方法
arr=arr.sort()
let newarr=[arr[0]]
for(let i=1;i<arr.length;i++){
    if(arr[i]!==arr[i-1]){
        newarr.push(arr[i])
    }
}
console.log(newarr)
//6.双重for循环
for(let i=0;i<arr.length;i++){
    for(let j=1;j<arr.length;j++){
        if(arr[i]===arr[j]){
            arr.splice(j,1)
            j--
        }
    }
}
console.log(arr)
```

**数组扁平化**

```js
  let arr1=[1,2,3,[4,5,[6,7],8,[9,10],11,12]];
//1.普通递归
function flat(arr){
    let res=[]
    arr.forEach((item)=>{
        if(Array.isArray(item)){
            res.push(...flat(item))
        }else{
            res.push(item)
        }
    })
    return res
}
//2.arr1.join().split(',').map(Number);
//3.reduce
function flatten(arr){
    return arr.reduce((pre,cur)=>{
        return pre.concat(Array.isArray(cur)?flatten(cur):cur)
    },[])
}
//4.扩展运算符
//数组的另一个方法some，目的是判断当前数组是否还有数组元素，如果有则对数组进行一层展开，同时将展开结果作为下一次判断的条件。
function flatten(arr){
    while(arr.some(item=>Array.isArray(item))){
        arr=[].concat(...arr)
    }
    return arr;
}
//5.正则和JSON
function flatten(arr){
    let str=JSON.stringify(arr)
    str=str.replace(/(\[|\])/g,'')
    // 拼接最外层，变成JSON能解析的格式
    str='['+str+']'
    return JSON.parse(str)
}
//6.Array.proptotype.flat
function flatten(arr){
    return arr.flat(Infinity)
}
```

#### 2.多种方式实现深浅拷贝、对比优缺点

**浅拷贝：**只是将数据中所有的数据引用下来，依旧指向同一个存放地址，拷贝之后的数据修改之后，也会影响到原数据的中的对象数据

**深拷贝：** 将数据中所有的数据拷贝下来，对拷贝之后的数据进行修改不会影响到原数据

浅拷贝：

```js
//1.Object.assign(target,source)
let obj={a:1,b:2}
let obj1 = {}
Object.assign(obj1, obj)
console.log(obj1);
//2.扩展运算符
let obj2={...obj}
//3.封装一个函数
function shallowClone(target){
    //首先判断是基本类型还是引用类型
    if(typeof target ==='object'&& target!==null){
        //判断是对象还是数组
        let cloneTarget=Array.isArray(target)?[]:{}
        for(let key in target){
            if(target.hasOwnProperty(key)){
                cloneTarget[key]=target[key]
            }
        }
        return cloneTarget
    }else{
        return target
    }
}
//数组独有
//4.concat()
let arr2=arr.concat()
//5.slice
let arr3=arr.slice()
//6.Array.from()
let arr4=Array.from(arr)
```

深拷贝

```js
// 1.JSON.parse(JSON.stringify(obj))是通过JSON.stringify()把对象序列化成字符串，然后再把字符串转换成新对象。
// 新的对象和原对象没有关联。因为它是根据字符串转换创建。
// 在函数、日期、正则表达式时，JSON.stringify时，都会被转换成对象{}
//2.基础班递归调用实现深拷贝
function deepClone(target){
    //首先判断是基本类型还是引用类型
    if(typeof target ==='object'&& target!==null){
        //判断是对象还是数组
        let cloneTarget=Array.isArray(target)?[]:{}
        for(let key in target){
            if(target.hasOwnProperty(key)){
                cloneTarget[key]=deepClone(target[key])
            }
        }
        return cloneTarget
    }else{
        return target
    }
}
```

| 存在的问题                                            | 改进方案                                                     |
| :---------------------------------------------------- | ------------------------------------------------------------ |
| 1. 不能处理循环引用                                   | 使用 [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) 作为一个Hash表来进行查询 |
| 2. 只考虑了`Object`对象                               | 当参数为 `Date`、`RegExp` 、`Function`、`Map`、`Set`，则直接生成一个新的实例返回 |
| 3. 属性名为`Symbol`的属性<br/>4. 丢失了不可枚举的属性 | 针对能够遍历对象的不可枚举属性以及 Symbol 类型，我们可以使用 Reflect.ownKeys()<br/>注：Reflect.ownKeys(obj)相当于[...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)] |
| 4. 原型上的属性                                       | [Object.getOwnPropertyDescriptors()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors)设置属性描述对象，以及[Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)方式继承原型链 |

什么是循环引用？==> 对象的属性间接或直接的引用了自身的情况。

```js
function circularReference() {
  let obj1 = {
	};
	let obj2 = {
 	 b: obj1
	};
	obj1.a = obj2;
}
```

上述代码在内存中的示意图

![](D:\Web\自己总结的学习记录\md图片\20201208223607.png)

解决循环引用问题，我们可以额外开辟一个存储空间，来存储当前对象和拷贝对象的对应关系，当需要拷贝当前对象时，先去存储空间中找，有没有拷贝过这个对象，如果有的话直接返回，如果没有的话继续拷贝，这样就巧妙化解的循环引用的问题。

这个存储空间，需要可以存储`key-value`形式的数据，且`key`可以是一个引用类型，我们可以选择`Map`这种数据结构：

1. 检查`map`中有无克隆过的对象
2. 有就直接返回
3. 没有 - 将当前对象作为`key`，克隆对象作为`value`进行存储
4. 继续克隆

```js
function deepClone(target，map=new Map()){
    //首先判断是基本类型还是引用类型
    if(typeof target ==='object'&& target!==null){
        //判断是对象还是数组
        let cloneTarget=Array.isArray(target)?[]:{}
        //检查map中有无克隆过的对象
        if(map.get(target)){
            //有，就直接返回
            return map.get(target)
        }
        //没有，就将当前对象作为key,克隆对象作为value进行存储
        map.set(target,cloneTarget)
        for(let key in target){
            if(target.hasOwnProperty(key)){
                cloneTarget[key]=deepClone(target[key])
            }
        }
        return cloneTarget
    }else{
        return target
    }
}
```

使用weakMap()来实现弱引用

WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的。

弱引用： 一个对象若只被弱引用所引用，则被认为是不可访问（或弱可访问）的，并因此可能在任何时刻被回收。

设想一下，如果我们要拷贝的对象非常庞大时，使用Map会对内存造成非常大的额外消耗，而且我们需要手动清除Map的属性才能释放这块内存，而WeakMap会帮我们巧妙化解这个问题。

```js
//完整实现
// Map 强引用，需要手动清除属性才能释放内存。
// WeakMap 弱引用，随时可能被垃圾回收，使内存及时释放，是解决循环引用的不二之选。
// Map 强引用，需要手动清除属性才能释放内存。
// WeakMap 弱引用，随时可能被垃圾回收，使内存及时释放，是解决循环引用的不二之选。
function cloneDeep(obj, map = new WeakMap()) {
  if (obj === null || obj === undefined) return obj // 不进行拷贝
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  // 基础类型不需要深拷贝
  if (typeof obj !== 'object' && typeof obj !== 'function') return obj
  // 处理普通函数和箭头函数
  if (typeof obj === 'function') return handleFunc(obj)
  // 是对象的话就要进行深拷贝
  if (map.get(obj)) return map.get(obj)
  let cloneObj = new obj.constructor()
  // 找到的是所属类原型上的 constructor，而原型上的 constructor 指向的是当前类本身。
  map.set(obj, cloneObj)
  
  if (getType(obj) === '[object Map]') {
    obj.forEach((item, key) => {
      cloneObj.set(cloneDeep(key, map), cloneDeep(item, map));
    })
  }
  if (getType(obj) === '[object Set]') {
    obj.forEach(item => {
      cloneObj.add(cloneDeep(item, map));
    })
  }
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], map)
    }
  }
  return cloneObj
}

// 获取更详细的数据类型
function getType(obj) {
    return Object.prototype.toString.call(obj)
}
// 处理普通函数和箭头函数
function handleFunc(func) {
  if(!func.prototype) return func // 箭头函数直接返回自身
  const bodyReg = /(?<={)(.|\n)+(?=})/m
  const paramReg = /(?<=\().+(?=\)\s+{)/
  const funcString = func.toString()
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString)
  const body = bodyReg.exec(funcString)
  if(!body) return null
  if (param) {
    const paramArr = param[0].split(',')
    return new Function(...paramArr, body[0])
  } else {
    return new Function(body[0])
  }
}

```

#### 3.手写函数柯里化工具函数、并理解其应用场景和优势

函数里面返回函数，多次接收参数最后统一处理的方法

```js
//实现函数的柯里化
let sum=(a,b,c,d,e)=>{
    return a+b+c+d+e
}
function currying(func){
    return curried(...args){
        if(arg.length>=func.length){
            return func.apply(this,args)
        }else{
            return function(...args2){
                return curried.apply(this,args.concat(...args2))
            }
        }
    }
}
let res=currying(sum)
console.log(res(1,2,3,4,5))
console.log(res((1)(2,3)(4,5)))
console.log(res((1)(2)(3)(4)(5)))
```

#### 4.手写防抖和节流工具函数、并理解其内部原理和应用场景

防抖（debunce）：在一段时间内，函数只执行一次，如果在这段时间内又触发了这个函数，则会重新计时

立即执行：触发事件后函数会立即执行，然后 n 秒内不触发事件才能继续执行函数的效果。

不是立即执行(执行在最后一次）

```js
<button class='btn'>点击</button>

let btn=document.querySelector('.btn')
btn.addEventListener('click',debunce(submit,2000,true))
function submit(){
    console.log('点击了');
}
function debunce(fn,time,immediate){
    let timer=null;
    return function(){
        if(timer){
            clearTimeout(timer)
        }
      	if(immediate){
            let firstClick=!timer
            if(firstClick){
                fn.call(this)
            }
            timer=setTimeout(()=>{
                timer=null
            },time)
        }else{
            timer=setTimeout(()=>{
        fn.call(this)
    },time)
    }
        }
}
```

节流（throttle）

连续触发事件，但在3秒内只执行一次

```js
 let btn=document.querySelector('.btn')
 btn.addEventListener('click',throttle(submit,2000))
 function submit(){
            console.log('点击了');
        }
function throttle(fn,time){
    let begin=0;
    return function(){
        let curTime=new Date().getTime()
        if(curTime-begin>time){
            fn.call(this)
            begin=curTime
        }
    }
}
```

#### 5.实现一个`sleep`函数

sleep函数作用是让线程休眠，等到指定时间在重新唤起。

方法1：这种实现方式是利用一个伪死循环阻塞主线程。因为JS是单线程的。所以通过这种方式可以实现真正意义上的sleep()。

```js
function sleep(delay){
	let start=new Date().getTime()
	while(new Date().getTime()-start<delay){
	continue;
	}
}
function test() {
  console.log('111');
  sleep(2000);
  console.log('222');
}
test()
```

方法2：定时器

```js
function sleep(time,callback){
    setTimeout(callback,time)
}
  sleep(1000, () => {
                console.log(1000)
            })
```

方法3：Promise

```js
  const sleep = (time) => {
        return new Promise((resolve) => {
          setTimeout(resolve, time);
        });
      };
      sleep(2000).then(() => {
        console.log(111);
      });
```

方法4：async

```js
function sleep(time){
    return new Promise((resolve)=>{
        setTimeout(resolve,time)
    })
}
async function test(){
    let temp=await sleep(2000)
    console.log(11)
} 
test()
```

### 手动实现前端轮子

#### 1.手动实现`call、apply、bind`

call()：改变this指向，立即执行这个函数

```js
Function.prototype.MyCall=function(obj,...args){
    obj=obj?Object(obj):window
    let fun=Symbol('fun')
    obj.fun=this
    obj.fun(...args)
    delete obj.fun
}
function add (x, y) 
{ 
    console.log (x + y);
    console.log(this);
} 
function minus (x, y) 
{ 
    console.log (x - y); 
} 
add.Mycall (minus , 4, 1);
```

apply：与call差不多，只是参数为数组

```js
Function.prototype.MyApply=function(obj,arr){
    obj=obj?Object(obj):window
    if(!Array.isArray(arr)) throw new TypeError('传递的参数必须是数组')
    let fun=Symbol('fun')
    obj.fun=this
    obj.fun()
    delete obj.fun
}
```

bind()：改变this指向后不会立即指向，而是返回一个永久改变this指向的函数

```js
Function.prototype.MyBind=function(obj,...args){
    obj=obj?Object(obj):window
    return (...args1)=>{
        	let fun=Symbol('fun')
            obj.fun=this
        	obj.fun(...[...args,...args1])
        	delete obj.fun
    }
}
function print(){
            console.log('lijiayan',...arguments);
            console.log(this);
        }
        let obj={
            name:'lijiayan',
            age:19
        }
      let fn=print.MyBind(obj,1,2)
      fn(3,4)
```

#### 2.手写一个`EventEmitter`实现事件发布、订阅

发布-订阅模式其实是一种对象间一对多的依赖关系，当一个对象的状态发送改变时，所有依赖于它的对象都将得到状态改变的通知。
订阅者（Subscriber）把自己想订阅的事件注册（Subscribe）到调度中心（Event Channel），当发布者（Publisher）发布该事件（Publish Event）到调度中心，也就是该事件触发时，由调度中心统一调度（Fire Event）订阅者注册到调度中心的处理代码。

实现思路

1. 创建一个 `EventEmitter` 类
2. 在该类上创建一个事件中心（Map）
3. `on` 方法（订阅者注册事件到调度中心）
4. `emit` 方法（发布者发布事件到调度中心，调度中心处理代码）
5. `off` 方法（取消订阅）
6. `once` 方法只监听一次，调用完毕后删除缓存函数（订阅一次）

```js
class EventEmitter{
    //首先初始化消息队列(调度中心)
    constructor(){
        this.message={}
    }
    //订阅者注册事件到调度中心
    //on() 把函数都添加到消息队列中
    //type:事件类型
    on(type,callback){
        //先判断一下消息队列中有没有这个事件类型
        if(!this.message[type]){
            //如果没有，就初始化创建一个缓存列表，由于一个事件可能注册多个回调函数，所以使用数组来存储
            this.message[type]=[]
        }
        //如果有这个事件类型，就往她后面追加一个新的回调
        this.message[type].push(callback)
    }
    //发布者发布消息，触发消息队列中的内容
    emit(type){
        //判断消息队列中是否有订阅
        if(!this.message[type]) return 
        this.message[type].forEach(item=>{
            //如果有订阅，就挨个执行这个消息的回调
            item();
        })
    }
    //删除消息队列中的内容
    off(type,callback){
        //首先判断是否有订阅，没有订阅的话直接return
        if(!this.message[type]) return
        //判断这个事件有没有回调
        if(!callback){
            this.message[type]=undefined
            return 
        }
        //如果有这个回调，就只删除这一个消息回调
        this.message[type]=this.message[type].filter(item=>{
            item!==callback
        })
    }
    //只执行一次就删除
    once(type,callback){
        let fn=(...args)=>{
            callback.apply(this,...args)
            this.off(type,fn)
        }
        this.on(type,fn)
    }
}
```

```js
//测试代码
	  function handlerA() {
          console.log('buy handlerA');
      }
      function handlerB() {
          console.log('buy handlerB');
      }
      function handlerC() {
          console.log('buy handlerC');
      }
      // 使用构造函数创建一个实例
      const person1 = new EventEmitter();

      person1.on('buy', handlerA);
      person1.on('buy', handlerB);
      person1.on('buy', handlerC);

      person1.once('buy',handlerB)
      //console.log('person1 :>> ', person1);

      // 触发 buy 事件
      person1.emit('buy')
      // 移除buy 中的handleA
      person1.off('buy',handlerA)
      console.log('person1 :>> ', person1);
```

#### 3.可以说出两种实现双向绑定的方案、可以手动实现

**通过Object.defineProperty()实现**

数据劫持：实现当你对属性进行读取，修改时，会被拦截监听到，就会重新解析模板，更新页面

数据代理：当更新页面中数据的值的时候，会产生数据代理

```js
//vue的数据劫持
let data={
    name:'李佳燕',
    age:20
}
//创建一个监视的实例对象
const obs=new Observer(data)
let vm={}
vm._data=data=obs
function Observer(obj){
    //汇总对象中所有的属性
    const keys=Object.keys(obj)
    //遍历
    keys.forEach((k)=>{
        Object.defineProperty(this,k,{
            get(){
                return obj[k]
            }
            set(value){
            console.log(`${k}被修改了，我要去解析模板，更新页面了`)
            obj[k]=value
        }
        })
    })
}
```

但通过Object.defineProperty()实现时，存在的问题

新增、删除属性，页面不会更新

直接通过下标修改数组，页面也不会更新

**通过Proxy()实现**

```js
let person={
    name:'李佳燕',
    age；20
}
const p = new Proxy(person,{
    get(target,propName){
        console.log(`有人读取了p身上的${propName}属性`)
        return target[propname]
    },
    set(target,propName,value){
    target[propName]=value
},
    deleteProperty(target,propName){
        console.log(`有人删除了p身上的${propName}属性，我要去更新页面了`)
       return delete target[propName]
    }
})
```

```js
let person={
    name:'李佳燕',
    age；20
}
const p = new Proxy(person,{
    get(target,propName){
        console.log(`有人读取了p身上的${propName}属性`)
        return Reflect.get(target,propName)
    },
    set(target,propName,value){
    Reflect.set(target,propName,value)
},
    deleteProperty(target,propName){
        console.log(`有人删除了p身上的${propName}属性，我要去更新页面了`)
       return Reflect.deleteProperty(target,propName)
    }
})
```

```js
//通过Reflect获取对象的数据
Object.definProperty(obj,'c',{
           get(){
               return 3
           }          
 })
Object.definProperty(obj,'c',{
           get(){
               return 4
           }          
 })
//上面的代码会报错，不能重复定义‘c’这个属性
//使用Reflect.defineProperty
Reflect.definProperty(obj,'c',{
           get(){
               return 3
           }          
 })
Reflect.definProperty(obj,'c',{
           get(){
               return 4
           }          
 })
//这部分代码不会直接报错，但把错误写在了返回值里面
//对于封装框架来说，直接报错，不好捕获错误（使用try...catch）太麻烦了，用Reflect更有好一些
```

#### 4.手写一个模版引擎，并能解释其中原理

![](D:\Web\自己总结的学习记录\md图片\3407000-badfeb31bad7163d.webp)

**简单**的模板引擎代码

```js
var template = '<p>Hello,my name is <%name%>. I am  <%age%> years old.</p>';
var regex = /<%([^%>]+)?%>/g;
//全局匹配以<%开头，中间不是%或>并以%>结尾的配配项，(如图)
    var data ={
        name:'zyn',
        age:31
    }
    var TemplateEngine = function (tpl,data){
        
        while(match = regex.exec(tpl)){
            tpl = tpl.replace(match[0],data[match[1]])
        }
        return tpl
    }
    var string = TemplateEngine(template,data)
    console.log(string);
```

```js
(1)第一次循环 match =["<%name%>", "name"]
(2)tpl =tpl.replace('<%name%>','zyn')
(3)返回tpl='<p>Hello,my name is zyn. I am  <%age%> years old.</p>'

(1)第二次循环 match =["<%age%>", "age"]
(2)tpl =tpl.replace('<%age%>','31')
(3)返回tpl='<p>Hello,my name is zyn. I am  31 years old.</p>'

```

**复杂**的模板引擎

问题：当data中的数据开始嵌套时

```js
 var data ={
        name:'zyn',
        profile:{age:31}
    }
 //这样我们要得到age的话在模板中应该是<%profile.age>,在被替换时变成了data['profile.age']==>这样的结果就是undefined
//如果能够在<%和%>之间直接使用Javascript代码就最好了，这样就能对传入的数据直接求值，像下面这样：
 var template = '<p>Hello, my name is <%this.name%>. I\'m <%this.profile.age%> years old.</p>'
```

```js
var TemplateEngine = function(tpl, data) {
    var re = /<%([^%>]+)?%>/g,
        //code保存函数体
        code = 'var Arr=[];\n',
        //游标cursor告诉我们当前解析到了模板中的哪个位置
        cursor = 0;
    //函数add，它负责把解析出来的代码行添加到变量code中去。
    var add = function(line) {
        code += 'Arr.push("' + line.replace(/"/g, '\\"') + '");\n';
    }
    //第一次循环：match=[
     //    0:<%this.name%>",
     //    1:"this.name",
    //     index:21,
   //      input:"<p>Hello, my name //is<%this.name%>.I'm<%this.profile.age%>years old.</p>",
 //       length:2
//]
    while(match = re.exec(tpl)) {
        add(tpl.slice(cursor, match.index));
        add(match[1]);
        cursor = match.index + match[0].length;
    }
    add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return Arr.join("");'; // <-- return the result
    console.log(code);
    return tpl;
}
//将上面的代码执行完成后 通过Arr.join("")得到 
//var Arr[];
//Arr.push("<p>Hello, my name is ");
//Arr.push("this.name");
//Arr.push(". I'm ");
//Arr.push("this.profile.age")
//Arr.push("years old </p>")
//return Arr.join("")
//但上面的this.name和this.profile.age不能有“”
//将add函数修改下
//双引号字符进行转义
var template = '<p>Hello, my name is <%this.name%>. I\'m <%this.profile.age%> years old.</p>';
var data = {
    name: "zyn",
    profile: { age: 29 }
}
console.log(TemplateEngine(template, data));
```

使用模板引擎实现下面效果

![](D:\Web\自己总结的学习记录\md图片\3407000-1e427ff7e7357b37.webp)

```js
    var songs =[
    {name:'刚刚好', singer:'薛之谦', url:'http://music.163.com/xxx'},
    {name:'最佳歌手', singer:'许嵩', url:'http://music.163.com/xxx'},
    {name:'初学者', singer:'薛之谦', url:'http://music.163.com/xxx'},
    {name:'绅士', singer:'薛之谦', url:'http://music.163.com/xxx'},
    {name:'我们', singer:'陈伟霆', url:'http://music.163.com/xxx'},
    {name:'画风', singer:'后弦', url:'http://music.163.com/xxx'},
    {name:'We Are One', singer:'郁可唯', url:'http://music.163.com/xxx'} 

]

var html='<div class="song-list">'+
'  <h1>热歌榜</h1>'+
'  <ol>'+
'<%for(var i=0; i<this.songs.length;i++){%>'+
'<li><%this.songs[i].name%> - <%this.songs[i].singer%></li>'+
'<%}%>'+
'  </ol>'+
'</div>'
//? 出现零次或一次 + 出现一次或多次
let TemplateEngine=function(template,data){
    //全局匹配以<%开头，中间不是%或>并以%>结尾的配配项
    let re=/<%([^%>]+)?%>/g
    let reExp=/(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g
    let code='let Arr=[];\n'
    let cursor=0
    let add = function(line,js){
        //外层的三目运算符判断是匹配的那部分还是字符串那部分
        //当他是匹配的那部分时，要判断它是否是循环或者判断语句
        js? (code += line.match(reExp) ? line + '\n' : 'Arr.push(' + line + ');\n') 
        :(code += line != '' ? 'Arr.push("' + line.replace(/"/g, '\\"') + '");\n' : '')
        return add;
    }
    while(match=re.exec(template)){
        add(template.slice(cursor,match.index))
        add(match[1],true)
        cursor=match.index+match[0].length
    }
    add(template.substr(cursor,template.length-cursor))
    code+='return Arr.join("");'; 
    console.log(code);
    result=new Function(code.replace(/[\r\t\n]/g, ''))
    return result
}
//最后把结果渲染到页面上
let res=TemplateEngine(html,songs)
document.body.innerHTML=res();
```

#### 5.手写`懒加载`、`下拉刷新`、`上拉加载`、`预加载`等效果

**实现图片懒加载**

```js
//htm部分
<style>
    img {
      display: block;
      margin-bottom: 50px;
      height: 400px;
    }
</style>
<body>
    <img src="" lazyload="true" data-src="./imgs/QQ截图20220417181646.png" />
  <img src="" lazyload="true" data-src="./imgs/QQ截图20220419112613.png" />
  <img src="" lazyload="true" data-src="./imgs/QQ截图20220419130511.png" />
  <img src="" lazyload="true" data-src="./imgs/QQ截图20220419130549.png" />
  <img src="" lazyload="true" data-src="./imgs/R-C.jpg" />
</body>
```

```js
//js部分
let imgList=[...document.querySelectorAll('img')]
let length=imgList.length
const imgLazyLoad=function(){
    let count=0;
   	let deleteIndexList=[]
    imgList.forEach((img,index)=>{
        let rect=img.getBoundingClientRect()
        if(rect.top<window.innerHeight){
            img.src=img.dataset.src
            deleteIndexList.push(index)
            count++
            //图片全部加载完成后移除事件监听；
            if(count===length){
          document.removeEventListener('scroll',imgLazyLoad())
            }
        }
    })
    //加载完的图片，从 imgList 移除；
    imgList=imgList.filter((img,index)=> !deleteIndexList.includes(index) )
}
document.addEventListener('scroll',imgLazyLoad)
```

**手写实现上拉加载**

![](D:\Web\自己总结的学习记录\md图片\2082008-20210512092746798-1735689861.jpg)

上拉加载本质是页面触底，或者快要触底时的动作

判断页面触底我们需要先了解一下下面几个属性

- `scrollTop`：滚动视窗的高度距离`window`顶部的距离，它会随着往上滚动而不断增加，初始值是0，它是一个变化的值
- `clientHeight`:它是一个定值，表示屏幕可视区域的高度；
- `scrollHeight`：页面不能滚动时是不存在的，`body`长度超过`window`时才会出现，所表示`body`所有元素的长度

综上我们得出一个触底公式：

```js
scrollTop + clientHeight >= scrollHeight
```

```js
//简单实现
//html部分
 ul li {
        border: 1px solid pink;
        height: 300px;
        list-style: none;
    }
  <ul>
        <li>啦啦啦</li>
        <li>啦啦啦</li>
        <li>啦啦啦</li>
        <li>啦啦啦</li>
        <li>啦啦啦</li>
        <li>啦啦啦</li>
        <li>啦啦啦</li>
  </ul>
```

```js
 let list = document.querySelector('ul')
 //在上滑加载时做了一个节流
 window.addEventListener('scroll', throttle(AsyncFun, 2000))
        function AsyncFun() {
            let clientHeight = document.documentElement.clientHeight; //浏览器高度
            let scrollHeight = document.body.scrollHeight;
            let scrollTop = document.documentElement.scrollTop;
            let distance = 50;
            //当距离body还有50时开始触发
            if ((scrollTop + clientHeight) >= (scrollHeight - distance)) {
                //上拉时到底部后做的异步加载动作
                console.log('加载了...')
            }
        }
		//节流
        function throttle(fn, time) {
            let begin = 0;
            return function () {
                let curTime = new Date().getTime();
                if (curTime - begin > time) {
                    fn.call(this);
                    begin = curTime;
                }
            };
        }
```

**下拉刷新**

下拉刷新的本质是页面本身置于顶部时，用户下拉时需要触发的动作

关于下拉刷新的原生实现，主要分成三步：

- 监听原生`touchstart`事件，记录其初始位置的值，`e.touches[0].pageY`；
- 监听原生`touchmove`事件，记录并计算当前滑动的位置值与初始位置值的差值，大于`0`表示向下拉动，并借助CSS3的`translateY`属性使元素跟随手势向下滑动对应的差值，同时也应设置一个允许滑动的最大值；
- 监听原生`touchend`事件，若此时元素滑动达到最大值，则触发`callback`，同时将`translateY`重设为`0`，元素回到初始位置

```js
//html部分
 <p class="text"></p>  
    <ul id="box">  
        <li>111</li>  
        <li>222</li>  
        <li>333</li>  
        <li>444</li>  
        <li>555</li>  
        ...  
    </ul>  
```

```js
let box=document.getElementById('box')
   let text=document.querySelector('.text')
   //开始的位置
   let startPos=0
   //移动的距离
   let move=0
   //监听touchStart事件，记录初始值
    box.addEventListener('touchstart',function(e){
        startPos=e.touches[0].pageY
        box.style.position='relative'
        box.style.transition='transfrom 0s'
    })
    //监听touchmove事件，记录滑动差值
    box.addEventListener('touchmove',function(e){
        //e.touches[0].pageY:当前的位置
        move=e.touches[0].pageY-startPos
        if(move>0&&move<60){
            text.innerHTML='下拉刷新'
            box.style.transfrom='translateY('+move+'px)'
            if(move>55){
                text.innerHTML='释放更新'
            }
        }
    })
    //监听touchend离开事件
    box.addEventListener('touchend',function(e){
        box.style.transition = 'transform 0.5s ease 1s';  
        box.style.transform = 'translateY(0px)';  
        text.innerHTML='更新中...'
    })
```

### instanceof的底层实现原理，手动实现一个instanceof

实现原理：右边变量的 prototype 在左边变量的原型链上即可.

```javascript
       function my_instansof(L, R) {
            // 右边的原型对象
            let R_protoType = R.prototype
            // 左边的对象实例的__proto__指向它的原型对象
            let L_protoType = L.__proto__
            while (true) {
                if (L_protoType === null) return false;
                if (L_protoType === R_protoType) return true;
                L_protoType = L_protoType.__proto__
            }
        }
        let date = new Date();
        console.log(date instanceof Date) //true
        console.log(date instanceof Object) //false
        console.log(my_instansof(date, Date));
```

### 可以描述`new`一个对象的详细过程，手动实现一个`new`操作符

new xxx():
首先返回一个新的对象，新的对象能访问到构造函数的属性，能访问构造函数中的原型属性，如果构造函数中返回的是一个对象，那么new的结果就是该对象

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}
var qb = new Person("qb", 20);
```

1.创建一个新的对象

2.将新对象的_proto_属性指向构造函数的原型对象

3.使用新对象调用函数，函数中的this被指向新实例对象qb

4.执行构造函数内部的代码,返回这个新的对象qb

**手写一个new:**

```js
function newFun(Con,...args){
    let obj={}
    obj.__proto__=Con.prototype
    let result=Con.apply(obj,...args)
    return result instanceof Object? result:obj
}
function Person(name){
this.name=name;
this.age=23;
// return {
// name:'lijiayan',
// age:20
// }
}
let obj=newFun(Person,['wjk'])
console.log(obj);
```

#### JSONP

是一种跨域解决方式，通过动态创建script标签来解决跨域问题，只支持get请求

使用方法

```html
//客户端
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
        let oscript = document.createElement('script')
        oscript.src = 'http://localhost:3001/info?callback=getInfo'
        document.body.appendChild(oscript)

        function getInfo(data) {
            console.log(data);
        }
    </script>

</body>

</html>
```



```js
//服务端收到请求返回如下数据
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

与ajax请求的异同点

**相同点**：

- 使用的目的一致，都是客户端向服务端请求数据，将数据拿回客户端进行处理。

**不同点**：

- ajax请求是一种官方推出的请求方式，通过xhr对象去实现，jsonp是民间发明，script标签实现的请求。
- ajax是一个**异步**请求，jsonp是一个**同步**请求
- ajax存在同源检查，jsonp不存在同源检查，后端无需做解决跨域的响应头。
- ajax支持各种请求的方式，而jsonp只支持get请求
- ajax的使用更加简便，而jsonp的使用较为麻烦。

**jsonp的实现原理**

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<!-- jsonp原理：动态生成一个Script标签，
    其src由接口url、请求参数、callback函数名拼接而成，
    利用js标签没有跨域限制的特性实现跨域请求。
 -->

<body>
    <button class="btn">提交</button>
    <script>
        let btn = document.querySelector('.btn')
        btn.addEventListener('click', jsonp({
            url: '',
            data: {
                name: 'lijiayan',
                age: 19
            },
            callbackName: 'func'
        }).then(data => {
            console.log(data);
        }));

        function jsonp({
            url,
            data,
            callbackName
        }) {
            return new Promise((resolve, result) => {
                // 得到最终的src
                // 拼接参数  name=lijiayan&age=19
                let arrs = [];
                for (let key in data) {
                    arrs.push(`${key}=${data[key]}`);
                }
                arrs.push(`callback=${callback}`);
                script.src = `${url}?${arrs.join('&')}`;
            })
            let script = document.createElement('script');
            document.body.appendChild(script);
            // 触发callback，触发后删除js标签和绑定在window上的callback
            window[callbackName] = function (data) {
                resolve(data);
                document.body.removeChild(script);
            }
        }
    </script>
</body>

</html>
```

