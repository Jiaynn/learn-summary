### 使用redux-toolkit

#### redux方面

取消createStore创建store.js，

redux-toolkit内置了thunk插件，不再需要单独安装，可以直接处理异步的action。

```js
//store.js
import {configureStore} from '@reduxjs/toolkit'
import CountSlice from './CountSlice'
import PersonSlice from './PersonSlice'
export default configureStore({
    reducer:{
        person:PersonSlice,
        count:CountSlice
    }
})
```

创建slice
使用createSlice方法创建一个slice。每一个slice里面包含了reducer和actions，可以实现模块化的封装。所有的相关操作都独立在一个文件中完成。而不再是单独创建reducer，actions

```js
//CountSlice.js
import {createSlice} from '@reduxjs/toolkit'
export const countSlice=createSlice({
    name:'count',
    initialState:{
        count:0
    },
    //reducers里面的属性会自动的导出为actions，在组件中可以直接通过dispatch进行触发
    reducers:{
        increment(state,action){
            state.count+=action.payload.steps
        },
        decrement(state,action){
            state.count-=action.payload.steps
        }
    }
})
//导出行为
export const {increment,decrement}=countSlice.actions
export const incrementAsync=(payload)=>(dispatch)=>{
    setTimeout(()=>{
        dispatch(increment(payload))
    },payload.time)
}
//将切片默认导出
export default countSlice.reducer
```

在组件中使用useDispatch()获取dispatch()方法

使用useSelector()获取state

```js
let dispatch=useDispatch()
let {count:{count},person:{person}}=useSelector((state)=>state)
```

![xxx](D:\Web\自己总结的学习记录\md图片\20201208223607.png)
