### 响应式原理

这段代码的问题是当我们修改了 price 之后，再去读取 total 时，还是原来的值，这样就没有实现响应式

```js
 let price = 5, quantity = 2;
 const total = price * quantity;
 console.log(`total: ${total}`);
 price = 20;
 console.log(`total: ${total}`);
```

所以我们要从零开始实现一个响应式

思路：当我们修改了price或quantity后，让计算总数的代码再计算一次

所以我们就可以将 ``total = price * quantity``存入一个地方，当我们更新某个值后，我们就可以再次执行一下这个代码

```js
let price=5,quantity=2
let total=0
//相当于是一个Set集，里面放着很多个effect
let dep=new Set()
//通过effect去保存这段代码
let effect=()=>{total=price*quantity}
function track(){
    dep.add(effect)
}
function trigger(){
    dep.forEach(effect=>effect())
}
//执行track函数，将每一个effect放入到set集中，形成deps
track()
//初次计算total值
effect()
console.log(total)  //10
```

在这个时候我们可以在控制台修改一下

```js
//将quantity值修改一下,这个时候再去读取total，仍然是10
quantity=3
//然后我们可以调用一下trigger()，去执行一下dep里面的effect，就是在计算一下现在total
trigger()
//然后我们再调用total,得到的值就是15了
```

这样我们就实现了单个值的响应式，但通常来说，一个对象里面有多个属性，每个属性都需要有自己的dep (effect的set集)，然后我们就可以通过Map去存储这些依赖关系，key表示每一个属性，而value就是我们的dep集

```js
//通过map结构存储
const depsMap=new Map()
function track(key){
    let dep=depsMap.get(key)
    if(!dep){
        depsMap.set(key,(dep=new Set()))
    }
    dep.add(effect)
}
function trigger(key){
    let dep=depsMap.get(key)
    if(dep){
        dep.forEach(effect=>{effect()})
    }
}
let product={price:5,quntity:2}
let total=0
let effect=()=>{
    total=product.price*product.quantity
}
track('quantity')
effect()
```



![](https://cdn.jsdelivr.net/gh/lijiayan921/Figure-bed/image/202210120023671.png)



![](https://cdn.jsdelivr.net/gh/lijiayan921/Figure-bed/image/202210120024893.jpg)



