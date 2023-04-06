#### null和undefined

null和undefined是所有类型的子类型，null和undefined可以赋值给其他类型

都如果我们在tsconfig.json中指定了strictNullChecks:true的话，null和undefined只能赋值给void和他们各自的类型

#### Number、String、Boolean、Symbol

相应原始类型的`包装对象`，从类型兼容性上看，原始类型兼容对应的对象类型，反过来对象类型不兼容对应的原始类型。

**因此，不要使用对象类型来注解值的类型，因为这没有任何意义。**

#### object、Object 和 {}

object类型代表了所有的非原始类型，也就是说我们不能把 number、string、boolean、symbol等 原始类型赋值给 object。在严格模式下，`null` 和 `undefined` 类型也不能赋给 object。

Object代表所有拥有toString、hasOwnProperty方法的类型，所以所有原始类型、非原始类型都可以赋给 Object。同样，在严格模式下，null 和 undefined 类型也不能赋给 Object。

**综上结论：{}、Object 是比object 更宽泛的类型，{} 和大 Object 可以互相代替，用来表示原始类型（null、undefined 除外）和非原始类型；而小 object 则表示非原始类型。**

#### 类型推断

注意let声明的类型推断出来的和类型注解是一样的，但const是不一样的，const类型推断出来的类型是字面量类型

#### 类型断言

当有时候我们自己比ts更清楚它的类型的时候，我们就需要使用到类型断言

```ts
//尖括号语法
let someValue:any='this is a string'
let strLength:number=(<string>someValue).length                 //as语法
let someValue:any='this is a string'
let strLength:number=(someValue as string).length
```

以上两种方式虽然没有任何区别，但是尖括号格式会与react中JSX产生语法冲突，因此我们更推荐使用 as 语法。

#### 常量枚举和普通枚举

常量枚举和普通枚举的区别是常量枚举会在编译阶段被移除且不能含有计算

```ts
enum Direction {
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}
let directions=[Direction.LEFT,Direction.RIGHT,Direction.TOP,Direction.BOTTOM]
//编译后的结果是
// var dircetions=[0,1,2,3]
```

假如包含了计算成员，则会在编译阶段报错

![](D:\Web\自己总结的学习记录\md图片\16d523c679114a548a10f90a840797ab_tplv-k3u1fbpfcp-zoom-in-crop-mark_3780_0_0_0.webp)

#### 字面量类型

目前，ts支持三种字面量类型：字符串字面量类型，数字字面量类型，布尔字面量类型

注意：比如 'this is string' （这里表示一个字符串字面量类型）类型是 string 类型（确切地说是 string 类型的子类型），而 string 类型不一定是 'this is string'（这里表示一个字符串字面量类型）类型，如下具体示例：

```ts
{
  let specifiedStr: 'this is string' = 'this is string';
  let str: string = 'any string';
  specifiedStr = str; // ts(2322) 类型 '"string"' 不能赋值给类型 'this is string'
  str = specifiedStr; // ok 
}
```

一般来说，字面量类型与联合类型一起使用，相较于使用string类型，使用字面量类型，可以将函数的参数限定为更具体的类型，这不仅提升了程序的可读性还保证了函数的参数类型

#### 类型拓宽

所有通过 let 或 var 定义的变量、函数的形参、对象的非只读属性，如果满足指定了初始值且未显式添加类型注解的条件，那么它们推断出来的类型就是指定的初始值字面量类型拓宽后的类型，这就是字面量类型拓宽。

```ts
  let str = 'this is string'; // 类型是 string
  let strFun = (str = 'this is string') => str; // 类型是 (str?: string) => string;
  const specifiedStr = 'this is string'; // 类型是 'this is string'
  let str2 = specifiedStr; // 类型是 'string'
  let strFun2 = (str = specifiedStr) => str; // 类型是 (str?: string) => string;
```

**null 和 undefined的类型拓宽**

比如对 null 和 undefined 的类型进行拓宽，通过 let、var 定义的变量如果满足未显式声明类型注解且被赋予了 null 或 undefined 值，则推断出这些变量的类型是 any：

```ts
{
  let x = null; // 类型拓宽成 any
  let y = undefined; // 类型拓宽成 any

  /** -----分界线------- */
  const z = null; // 类型是 null

  /** -----分界线------- */
  let anyFun = (param = null) => param; // 形参类型是 null
  let z2 = z; // 类型是 null
  let x2 = x; // 类型是 null
  let y2 = y; // 类型是 undefined
}

```

#### 接口的任意属性

一旦定义了任意属性，那么确定属性和可选属性的类型都必须是任意属性的子集

```ts
interface Person {
    name: string;
    age?: number; // ERROR 一旦定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集
    [propName: string]: string;
}

let tom: Person = {
    name: 'Tom',
    age: 25,
    gender: 'male'
};
```

一个接口中只能定义一个任意属性。如果接口中有多个类型的属性，则可以在任意属性中使用联合类型：

```ts
interface Person {
    name: string;
    age?: number;
    [propName: string]: string | number;
}

let tom: Person = {
    name: 'Tom',
    age: 25,
    gender: 'male'
};
```

#### interface和type的区别

interface可以定义重复的类型，而type不可以，他是别名，别名是不可以重复的

### 声明空间

#### 类型声明

类型声明空间用来做类型注释

```typescript
interface Bar{}
type Foo={}

let bar:Bar
let foo:Foo

//但不能把声明的类型作为变量使用
interface Bar{}
const bar=Bar  //Error: "cannot find name 'Bar'
```

#### 变量声明

变量声明空间不仅可以做类型注释，还可以当作变量使用

```typescript
class Foo {}

//当作类型使用
let foo:Foo

//当作变量使用
const some1=Foo

```

但要记住，不要把变量声明和变量空间声明搞混了

```typescript
// 这是变量声明，不能用做类型注释
const foo = 123;
let bar: foo; // ERROR: "cannot find name 'foo'"
```

#### keyof

该操作符可以用于获取某种类型的所有键，其返回类型是联合类型。

```ts
interface Person{
    name:string;
    age:number;
}
type k1=keyof Person   //'name'|'age'
type k2=keyof Person[]  //"length"|"toString"|"pop"|"push"|"concat"
type k3=keyof {[x:string]:Person}  //string|number
```

JavaScript 是一种高度动态的语言。有时在静态类型系统中捕获某些操作的语义可能会很棘手。以一个简单的`prop` 函数为例：

```js
function prop(obj, key) {
  return obj[key];
}
```

该函数接收 obj 和 key 两个参数，并返回对应属性的值。对象上的不同属性，可以具有完全不同的类型，我们甚至不知道 obj 对象长什么样。

那么在 TypeScript 中如何定义上面的 `prop` 函数呢？我们来尝试一下：

```js
function prop(obj: object, key: string) {
  return obj[key];
}
```

在上面代码中，为了避免调用 prop 函数时传入错误的参数类型，我们为 obj 和 key 参数设置了类型，分别为 `{}` 和 `string` 类型。然而，事情并没有那么简单。针对上述的代码，TypeScript 编译器会输出以下错误信息：

```js
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
```

元素隐式地拥有 `any` 类型，因为 `string` 类型不能被用于索引 `{}` 类型。要解决这个问题，你可以使用以下非常暴力的方案：

```js
function prop(obj: object, key: string) {
  return (obj as any)[key];
}
```

很明显该方案并不是一个好的方案，我们来回顾一下 `prop` 函数的作用，该函数用于获取某个对象中指定属性的属性值。因此我们期望用户输入的属性是对象上已存在的属性，那么如何限制属性名的范围呢？这时我们可以利用本文的主角 `keyof` 操作符：

```js
function prop<T extends object, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

### infer关键字

可以看这篇博客理解infer :[精读《Typescript infer 关键字》 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/402541135)

为什么会出现infer关键字：原因是泛型太整体化了，无法获得其中的子类型

```js
Class Duck{ swim } 

Class Dog{ swim,bark }

```

在 TypeScript 中 Dog 是 Duck 的子类型，因为它满足了 Duck 上的所有方法和属性，

协变：

```js
Complex(A) <: Complex(B)  ->  A <: B
```

逆变：

```js
Complex(A) <: Complex(B)  ->  B <: A
```

> 复杂类型：复杂类型包括类（Class）、对象、数组及函数等。其中类的属性、对象的属性、数组中的值、函数的参数和返回值类型都是构成复杂类型的类型。

**在 TypeScript 中，复杂类型的成员都会进行协变，包括对象、类、数组和函数的返回值类型。但是，函数的参数类型进行逆变。**

结合生活中的一个例子，来理解 协变 和 逆变 的概念。

- 张三的爸爸和张三
- 李四的爸爸和李四

> 协变关系

张三的爸爸给李四的爸爸打工，张三也给李四打工。

```text
张三爸爸 <: 李四爸爸   Complex(A) <: Complex(B)
张三 <: 李四           A <: B
```

> 逆变关系

张三的爸爸给李四的爸爸打工，李四给张三打工。

```text
张三爸爸 <: 李四爸爸   Complex(A) <: Complex(B)
张三 :> 李四           A :> B
```

### TypeScript中常用的内置工具

#### Record

`Record<K extends keyof any, T>` 的作用是将 `K` 中所有的属性的值转化为 `T` 类型。

定义：

```js
type Record<K extends keyof any,T>={
    [P in K] :T
}
```

示例：

```js
cosnt x：Record<K extends 'name'|'age',string>={
    name:string,
    age:string
}
```

#### Partial

Partial<T>是将某个属性里的属性全部变为可选项？

定义：

```js
type Partial<T>={
    [P in keyof T]?:T[P]
}
```

在以上代码中，首先通过 `keyof T` 拿到 `T` 的所有属性名，然后使用 `in` 进行遍历，将值赋给 `P`，最后通过 `T[P]` 取得相应的属性值的类。中间的 `?` 号，用于将所有属性变为可选。

示例：

```js
interface Foo{
    name:string
    age:number
}
type Bar=Partial<Foo>
//相当于
type Bar={
    name?:string
    age?:number
}
```

#### Required

作用是生成一个新类型，该类型于T拥有相同的属性，但所有属性都是必选项

定义：

```js
type Required<T>={
    [p in keyof T]-?:T[P]
}
```

其中 `-?` 是代表移除 `?` 这个 modifier 的标识。再拓展一下，除了可以应用于 `?` 这个 modifiers ，还有应用在 `readonly` ，比如 `Readonly<T>` 这个类型

示例：

```js
interface Foo{
    name:string,
    age?:number
}
type Bar=Required<Foo>
//相当于
type Bar={
    name:string,
    age:number
}
```

#### Pick

从某个类型中挑出一些属性出来

生成一个新类型，该类型拥有T中的K属性集

定义：

```js
type Pick<T,K extends keyof T>={
    [P in K]:T[P]
}
```

示例：

```js
interface Foo{
    name:string,
    age?:number,
    gender:string
}
type Bar=Pick<Foo,'age'|'gender'>
 //相当于
type Bar={
    age?:number,
    gender:string
}
```

#### Omit

生成一个新类型，该类型拥有T中除了K以外的所有属性

定义：

```js
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>> 
```

示例：

```ts
interface Foo{
    name:string,
    age?:number,
    gender:string
}
type Bar=Omit<Foo,'age'|'gender'>
 //相当于
type Bar={
   name:string
}
```



#### Exclude

`Exclude<T, U>` 的作用是将某个类型中属于另一个的类型移除掉。

定义：

```js
type Exclude<T,U>=T extends U ? never:T
```

示例：

```js
type A=number|string|boolean
type B=number | boolean
type Foo=Exclude<A,B>
//相当于
type Foo=string  
```

#### Extract

作用于Exclude相反

定义：

```js
type A=num
```

示例：

```js
type A=number|string|boolean
type B=number | boolean
type Foo=Extract<A,B>
//相当于
type Foo=number | boolean
```



#### ReturnType

`ReturnType<T>` 的作用是用于获取函数 `T` 的返回类型。

定义：

```js
type ReturnType<T extends (...args:any) => any > = T extends (...args:any)=>infer R ? R : any
```

示例：

```ts
type T0 = ReturnType<() => string>; // string
type T1 = ReturnType<(s: string) => void>; // void
type T2 = ReturnType<<T>() => T>; // {}
type T3 = ReturnType<<T extends U, U extends number[]>() => T>; // number[]
type T4 = ReturnType<any>; // any
type T5 = ReturnType<never>; // any
type T6 = ReturnType<string>; // Error
type T7 = ReturnType<Function>; // Error
```

### NonNullable

> `NonNullable<T>` 的作用是用来过滤类型中的 `null` 及 `undefined` 类型。

**定义**

```js
type NonNullable<T> = T extends null | undefined ? never : T;
```

**举例说明**

```js
type T0 = NonNullable<string | number | undefined>; // string | number
type T1 = NonNullable<string[] | null | undefined>; // string[]
```

### TypeScript在项目中使用

#### 类型注释

我们可以通过/** */形式的注释为ts类型做标记提示

![](D:\Web\自己总结的学习记录\md图片\e8effb6aa9ce4966b8bd3f34c660328d_tplv-k3u1fbpfcp-zoom-in-crop-mark_3780_0_0_0.webp)

当鼠标悬浮在使用到该类型的地方时，编辑器会有更好的提示：

![](D:\Web\自己总结的学习记录\md图片\8e4f0eb289a847ada67f3fde0187c07d_tplv-k3u1fbpfcp-zoom-in-crop-mark_3780_0_0_0.webp)

**使用React.FC声明和普通声明方式的区别是**

- React.FC显式地定义了返回类型，其他方式是隐式推导的
- React.FC对静态属性：displayName、propTypes、defaultProps提供了类型检查和自动补全
- React.FC为children提供了隐式的类型（ReactElement | null），但是目前，提供的类型存在[一些 issue](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped%2Fissues%2F33006)（问题）

### typeScript中使用钩子

react18中移除了React.FC中隐含的children属性,因为他破坏了大量antd的类型声明

#### useState

在ts中使用useState, 基本类型

```typescript
//基本类型
//val被推断为boolean类型，setVal只能处理boolean类型
const [val,setVal]=useState(false)
const [count,setCount]=useState<number>(0)
//对象类型
type person={
    name:string,
    age:number
}
const [p,setP]=useState<person>({name:'李佳燕',age:19})
```

```typescript
type AppProps = { message: string };
const App = () => {
    const [data] = useState<AppProps | null>(null);
    // const [data] = useState<AppProps | undefined>();
    // data && data.message
	//data?.message
    return <div>{data && data.message}</div>;
};
```

#### useEffect

与在react中用法一样

useEffect接收的第一个参数类型定义

```typescript
// 1. 是一个函数
// 2. 无参数
// 3. 无返回值 或 返回一个清理函数，该函数类型无参数、无返回值 。
type EffectCallback=()=>(void | ( ()=>void |undefined) )
```

示例：

```typescript
function DelayEffect(){
    const time=2000
    useEffect(()=>{
        const timer=setTimeout(()=>{
            //do something...
        },time)
        return ()=>clearTimeout(timer)
    })
}
```

同理，async处理异步请求

```typescript
useEffect(() => {
    (async () => {
        const { data } = await ajax(params);
        // todo
    })();
}, [params]);
```

#### useRef

```typescript
const Counter = () => {
  const [count, setCount] = useState<number>(0)
  const preCountRef = useRef<number>(count)

  useEffect(() => {
    preCountRef.current = count
  })

  return (
    <div>
      <p>pre count: { preCountRef.current }</p>
      <p>current count: { count }</p>
      <button onClick={() => setCount(count + 1)}>加</button>
    </div>
  )
}
//最开始两个值都是0，然后点击加，执行setCount,组件重新渲染，count值为1，这个时候useEffect里面的赋值操作让preCountRef.current的值为1了但是.current属性的值改变不会引发组件重新渲染，当我们再次点击加的时候，组件重新渲染，这时候得到的preCountRef.current=1,count=2,所以这样我们就能获得前一个值
```

我们可以看到，显示的总是状态的前一个值：



![img](https://pic1.zhimg.com/80/v2-b4129bd59714c7f248ea6ed4e660d9c8_1440w.jpg)

**useRef操作DOM节点，类似 createRef()：**

- 第一种方式的 ref1.current 是**只读的（read-only）**，并且可以传递给内置的 ref 属性，绑定 DOM 元素 **；**

- 第二种方式的 ref2.current 是**可变的**（类似于声明类的成员变量）

```typescript
const ref1 = useRef<HTMLElement>(null!);
const ref2 = useRef<HTMLElement | null>(null);
```

```typescript
//页面一加载输入框就聚焦
const iptRef=useRef<HTMLInputElement>(null)
useEffect(()=>{
    if(iptRef&&iptRef.current){
        iptRef.current.focus()
    }
  })  
<input type="text" ref={iptRef}></input>
```

#### useReducer

```typescript

  type ActionType = {
    type: 'reset' | 'decrement' | 'increment'
  }
  
  const initialState = { count: 0 }
  
 function reducer(state: typeof initialState, action: ActionType) {
    switch (action.type) {
      case 'reset':
        return initialState
      case 'increment':
        return { count: state.count + action.payload }
      case 'decrement':
        return { count: state.count - action.payload}
      default:
        throw new Error()
    }
  }
export default function Child2() {
 
    const [state, dispatch] = useReducer(reducer, { count: 0})
  return (
    <div className="child2">
      child2组件
      Count: {state.count}&nbsp;
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>&nbsp;
      <button onClick={() => dispatch({ type: 'increment',payload:5 })}>+</button>&nbsp;
      <button onClick={() => dispatch({ type: 'decrement' ,payload:2})}>-</button>
    </div>
  );
}

```

#### useContext

一般联合useReducer一起使用

```typescript
interface AppContextInterface {
    state: typeof initialState;
    dispatch: React.Dispatch<ACTIONTYPE>;
}

const AppCtx = React.createContext<AppContextInterface>({
    state: initialState,
    dispatch: (action) => action,
});
const App = (): React.ReactNode => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <AppCtx.Provider value={{ state, dispatch }}>
            <Counter />
        </AppCtx.Provider>
    );
};

// 消费 context
function Counter() {
    const { state, dispatch } = React.useContext(AppCtx);
    return (
        <>
            Count: {state.count}
            <button onClick={() => dispatch({ type: 'decrement', payload: '5' })}>-</button>
            <button onClick={() => dispatch({ type: 'increment', payload: 5 })}>+</button>
        </>
    );
}
```

```js
//使用js联合使用useContext和useReducer
import React, { createContext, useContext, useReducer } from 'react'

// 定义初始化值
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

// 创造一个上下文
const context = createContext(null);

function A() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <context.Provider value={{ state, dispatch }}>
      <div>这是A组件</div>
      <B></B>
    </context.Provider>
  )
}

function B() {
  const { state, dispatch } = useContext(context)
  return (
    <div>
      这是B组件: {state.count}
      <C></C>
    </div>
  )
}

function C() {
  const { state, dispatch } = useContext(context)
  return (
    <div>
      这是C组件: {state.count}
      <button onClick={() => dispatch({type: 'increment'})}>-</button>
      <button onClick={() => dispatch({type: 'decrement'})}>+</button>
    </div>
  )
}

```



### 定义对象类型

#### 知道确切的属性类型

```typescript
type ObjectType={
    obj1:{
        id:string,
        title:string
    };
    objArr:{
    id:string,
    title:string
}[]
}
```

#### 只知道是个对象，但不知道具体有哪些属性

```typescript
//错误写法
type ObjectType={
    obj:object,
    obj1:{}
}
//正确写法：使用Record
type ObjectType={
    obj:Record<string,unkonwn>
    //对于obj1:{}写法
    obj1:Record<string,unkonwn>
    obj2:unkonwn,
    obj3:Record<string,never>
}
```

**Record**

```typescript
interface PageInfo{
    title:string
}
type Page= 'home'|'about'|'contact'
const nav:Record<Page,PageInfo>={
    about:{title:'about'},
    home:{
        title:'home'
    }
    contact:{
    title:'contact'
}
}
```

#### ?.和??运算符

?.运算符：如果 `a `是 `undefined `或 `null`，那么 `x `不会进行递增运算。也就是说，链判断运算符一旦为真，右侧的表达式就不再求值。

?.运算符右侧不能是十进制数字

```js
a?.[++x]
// 等同于
a == null ? undefined : a[++x]
```

??运算符：当左侧的值为undefined或null时，返回 Hello,world!

```js
const text = data.text ?? 'Hello, world!'
```

### 工具扩展

如果我们想知道某个函数返回值的类型

```typescript
// foo 函数原作者并没有考虑会有人需要返回值类型的需求，利用了 TS 的隐式推断。
// 没有显式声明返回值类型，并 export，外部无法复用
function foo(bar: string) {
    return { baz: 1 };
}

// TS 提供了 ReturnType 工具类型，可以把推断的类型吐出
type FooReturn = ReturnType<typeof foo>; // { baz: number }
```

类型可以索引返回子属性类型

```typescript
function foo() {
    return {
        a: 1,
        b: 2,
        subInstArr: [
            {
                c: 3,
                d: 4,
            },
        ],
    };
}

type InstType = ReturnType<typeof foo>;
type SubInstArr = InstType['subInstArr'];
type SubIsntType = SubInstArr[0];

const baz: SubIsntType = {
    c: 5,
    d: 6, // type checks ok!
};

// 也可一步到位
type SubIsntType2 = ReturnType<typeof foo>['subInstArr'][0];
const baz2: SubIsntType2 = {
    c: 5,
    d: 6, // type checks ok!
};
```

### lib.d.ts

当我们安装TypeScript的时候，会顺带安装一个lib.d.ts声明文件，这个文件包含javascript运行时以及DOM中存在的各种常见的环境声明

`lib.d.ts` 的内容主要是一些变量声明（如：`window`、`document`、`math`）和一些类似的接口声明（如：`Window`、`Document`、`Math`）。

**修改原始类型**

当我们想使用不存在的成员时，只需要将他们添加到lib.d.ts中的接口声明即可，typeScript会自动接收他，一般我们可以创建一个global.d.ts

我们window这个接口上添加一个属性

```typescript
interface Window{
    helloWorld():void
}
```













