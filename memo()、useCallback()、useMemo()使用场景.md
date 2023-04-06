哈喽，大家好这里是 Jiaynn , 之前学习 React 的时候，老是对这三个 hooks 分不清，索性就总结一下吧，希望能帮助到大家
## memo()、useCallback()、useMemo()使用场景

当父组件的props或state变化时，render重新渲染，但传递给子组件的props没有发生变化说着只是简单调用了一下子组件，这时子组件也要重新渲染，这就导致了组件的不必要的渲染

### [](http://1.12.73.14/2022/10/19/hooks/#React-memo "React.memo()")React.memo()

**当父组件只是简单调用子组件，并未给子组件传递任何属性，我们可以通过memo来控制函数组件的渲染**

`React.memo()`将组件作为函数(memo)的参数，函数的返回值(Child)是一个新的组件。

```js
import { useState } from "react";
import { Child } from "./child";

export const Parent = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <Child />
    </div>
  );
};
```
```js
import {memo} from 'react'
export const Child=memo(()=>{
    consloe.log('渲染了')
    return <div>子组件</div>
})
//使用memo()包裹后的组件，在Parent组件重新渲染更新时，Child组件并没有重新渲染更新
```
**当我们传值给子组件时，这时使用memo函数就对控制组件的更新不起作用了**

父组件

```
import { useState } from "react";
import { Child } from "./child";

export const Parent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("小明");
  const increment = () => setCount(count + 1);
  const onClick = (name: string) => {
    setName(name);
  };
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <Child name={name} onClick={onClick} />
    </div>
  );
};
```
子组件
```
import { memo } from "react";

export const Child = memo(
  (props: { name: string; onClick: (value: any) => void }) => {
    const { name, onClick } = props;
    console.log("渲染了", name, onClick);
    return (
      <>
        <div>子组件</div>
        <button onClick={() => onClick("小红")}>改变 name 值</button>
      </>
    );
  }
);
```
出现这样结果的原因：

点击父组件按钮时，改变了父组件的count，导致父组件重新渲染

父组件重新渲染时，重新创建了onClick函数，导致传递给子组件的onClick属性发生了变化，导致子组件重新渲染

如果传递给子组件的只有基本数据类型将不会重新渲染

注意: 如果直接使用`useState`解构的setName传给子组件, 子组件将不会重复渲染，因为解构出来的是一个memoized 函数。

### [](http://1.12.73.14/2022/10/19/hooks/#React-useCallback "React.useCallback()")React.useCallback()

**所以，在这种情况下我们使用React.useCallback() useCallback(fn, deps)**

```
import { useCallback, useState } from "react";
import { Child } from "./child";

export const Parent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("小明");
  const increment = () => setCount(count + 1);
//使用useCallback钩子包裹的回调函数是memoized函数，他初次调用该函数时，缓存参数和计算结果，再次调用这个函数时，如果第二个参数依赖项没有发生改变，则直接返回缓存结果，不会重新渲染
  const onClick = useCallback((name: string) => {
    setName(name);
  }, []);

  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <Child name={name} onClick={onClick} />
    </div>
  );
};
```
**但当我们传递的属性name不字符串，而是对象时**

父组件
```
import { useCallback, useState } from "react";
import { Child } from "./child";

export const Parent = () => {
  const [count, setCount] = useState(0);
  // const [userInfo, setUserInfo] = useState({ name: "小明", age: 18 });
  const increment = () => setCount(count + 1);
  const userInfo = { name: "小明", age: 18 };

  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <Child userInfo={userInfo} />
    </div>
  );
};
```
子组件
```
import { memo } from "react";

export const Child = memo(
  (props: { userInfo: { name: string; age: number } }) => {
    const { userInfo } = props;
    console.log("渲染了", userInfo);
    return (
      <>
        <div>名字： {userInfo.name}</div>
        <div>年龄：{userInfo.age}</div>
      </>
    );
  }
);
```
点击父组件count，看到子组件每次都重新渲染了。 分析原因跟调用函数是一样的：

-   点击父组件按钮，触发父组件重新渲染；
-   父组件渲染，`const userInfo = { name: "小明", age: 18 };` 一行会重新生成一个新对象，导致传递给子组件的 userInfo 属性值变化，进而导致子组件重新渲染。
-   注意: 如果使用`useState`解构的userInfo, 子组件将不会重复渲染，因为解构出来的是一个memoized 值。

**这时我们使用React.useMemo() useMemo(() => fn, dep)**

### [](http://1.12.73.14/2022/10/19/hooks/#React-useMemo "React.useMemo()")React.useMemo()

useMemo()返回的是一个 memoized 值。

如果没有提供依赖项数组，`useMemo` 在每次渲染时都会计算新的值。
```
import { useMemo, useState } from "react";
import { Child } from "./child";

export const Parent = () => {
  const [count, setCount] = useState(0);
  // const [userInfo, setUserInfo] = useState({ name: "小明", age: 18 });
  const increment = () => setCount(count + 1);
  const userInfo = useMemo(() => ({ name: "小明", age: 18 }), []);
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <Child userInfo={userInfo} />
    </div>
  );
};
```
对比useCallback() 和useMemo()

useCallback(fn, deps) 返回该回调函数的`memoized回调函数`

```
const onClick = useCallback((name: string) => {
   setName(name);
 }, []);
```
useMemo(() => fn, dep) 返回的是一个 memoized 值。

```
const userInfo = useMemo(() => ({ name: "小明", age: 18 }), []);
```
以上就是他们的使用方法啦～