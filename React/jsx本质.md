#### jsx本质

实际上，jsx只是React.createElement(component,props,...children)函数的语法糖

所有的jsx最终都会转换成React.createElement()函数调用

```js
<script>
	  const message=<h2>hello lijiayan</h2>  
	  const message1=React.createElement("h2",null,"hello lijiayan")
</script>
```

通过React.createElement() 最终创建出一个ReactElement对象

为什么要创建ReactElement对象，他的作用是什么呢？

原因是React利用ReactElement对象组成了一个JavaScript的对象树，而这个对象树就是虚拟DOM (VDOM)，然后通过ReactDOM.render()映射到真实DOM

Virtual DOM 是一种编程理念，在这个理念中，UI以一种理想化或虚拟化的方式保存在内存中，并且他是一个简单的JS对象，通过ReactDOM.render()让虚拟DOM和真实DOM结合起来，这个过程叫做协调

为什么要使用虚拟DOM?

- 真实DOM很难跟踪状态的发生
- 操作真实DOM性能较低

虚拟DOM帮助我们从命令式编程转到了声明式编程

这种编程方式赋予了React声明式的API，只需要告诉React希望让UI是什么状态，react来确保DOM和这些状态是匹配的，你不需要直接进行DOM操作，就可以从手动更改DOM、属性操作、事件处理中解放出来