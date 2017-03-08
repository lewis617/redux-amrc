# Redux async middleware and reducer creator

[![NPM Version](https://img.shields.io/npm/v/redux-amrc.svg?style=flat)](https://www.npmjs.com/package/redux-amrc)
[![Build Status](https://travis-ci.org/lewis617/redux-amrc.svg?branch=master)](https://travis-ci.org/lewis617/redux-amrc)
[![codecov](https://codecov.io/gh/lewis617/redux-amrc/branch/master/graph/badge.svg)](https://codecov.io/gh/lewis617/redux-amrc)
[![npm](https://img.shields.io/npm/dm/redux-amrc.svg?maxAge=2592000)](redux-amrc)
[![npm](https://img.shields.io/npm/l/redux-amrc.svg?maxAge=2592000)](redux-amrc)

# 中文文档

这个插件将会帮你用更少的代码发起异步 action。通过这个插件你将：

- 不需要再手动编写异步 action 对象。
- 不需要再手动编写 reducer 来处理异步 action 对象。
- 获取插件自动生成的 value、error、loaded、loading、loadingNumber 等多个异步状态。

## 安装

```
npm install redux-amrc --save
```

## 初级用法

首先，将插件提供的 `asyncMiddleware` 连接到Redux的中间件列表上。

store/configureStore.js

```js
import { asyncMiddleware } from 'redux-amrc';
	
applyMiddleware(thunk, asyncMiddleware)

```

然后，将插件提供的 `reducerCreator` 安装到 Redux 的单一状态树的 `async` 节点上。

reducers/index.js

```js
import { combineReducers } from 'redux';
import { reducerCreator } from 'redux-amrc';

const rootReducer = combineReducers({
  async: reducerCreator()
});

export default rootReducer;
```

最后，使用插件提供的 `ASYNC` 来标记 action 创建函数（以被中间件识别），并将要处理的异步以 Promise 的形式传递进这个 action 创建函数中。至此，异步的所有状态都将在你的掌控之中了，你可以从 Redux 单一状态树的 `state.async` 节点上获取你想要的状态。

actions/index.js

```js
import { ASYNC } from 'redux-amrc';

/**
 * 这个action创建函数将会自动创建 LOAD 和 LOAD_SUCCESS 这两个 action,
 * state.async.[key] 将会变为 'success'
 */
function success() {
  return {
    [ASYNC]: {
      key: 'key',
      promise: () => Promise.resolve('success')
    }
  }
}

/**
 * 这个action创建函数将会自动创建 LOAD 和 LOAD_FAIL 这两个 action,
 * state.async.loadState.[key].error 将会变为 'fail'
 */
function fail() {
  return {
    [ASYNC]: {
      key: 'key',
      promise: () => Promise.reject('fail')
    }
  }
}
```
总结下该插件帮你发起的 action：

* `LOAD`: 特定数据开始加载
* `LOAD_SUCCESS`: 数据加载成功
* `LOAD_FAIL`: 数据加载失败

上述用法基本可以满足大部分场景了，因为往往我们只是发起异步获取数据而已，如果你想获取更多的异步状态，比如是否正在加载、是否加载完成，该插件也帮你提供了：

* `state.async.[key]`: Promise 成功时返回的数据
* `state.async.loadState.[key].loading`: 特定 key 的数据是否正在加载
* `state.async.loadState.[key].loaded`: 特定 key 的数据是否加载完成
* `state.async.loadState.[key].error`: Promise 出错时返回的错误信息
* `state.async.loadingNumber`: 当前有多少异步正在加载

## 高级用法

如果 Redux 单一状态树上某个节点的数据已经存在，你不想重复加载，你可以使用 `once` 选项，这会帮你减少异步请求，从而节约开销，提升性能。

```
function loadData() {
  return {
    [ASYNC]: {
      key: 'data',
      promise: () => fetch('/api/data')
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
      once: true
    }
  };
}
```
 
如果你想使用自己编写的 reducer 更新该插件某个节点上的数据，比如 `state.async.[key]` 。那么你可以在插件的 `reducerCreator` 方法上添加你的 reducers。其实 `reducerCreator` 的用法和 Redux 的 `combineReducers` 是一样的，都是接受多个 reducer 组成的对象。

```
// 你自己的 action 类型
const TOGGLE = 'TOGGLE';

// 你自己的 reducer
function keyReducer(state, action) {
  switch (action.type) {
    case TOGGLE:
      return state === 'success' ? 'fail' : 'success';
    default:
      return state
  }

}

// 添加 reducers 到 reducerCreator 上
const rootReducer = combineReducers({
  async: reducerCreator({
    key: keyReducer
  })
});

// 发起这个 action 将会更新 `state.async.key` 上的数据
dispatch({ type: TOGGLE }); 
```

## API

* `asyncMiddleware`: 一个 Redux 中间件

* `[ASYNC]`
	* `key`: 一个字符串
	* `promise(store)`: 一个返回Promise的函数
	
		* `store`(可选参数): Redux中的store对象
		
	* `once`: 布尔类型
	
* `reducerCreator(reducers)`: 返回 Reducer 的函数
	* `reducers`(可选参数): 多个reducer组成的对象
    
    
## 例子

[基本例子](https://github.com/lewis617/redux-amrc/tree/master/examples/01-basic)：一个最小的Node脚本，演示该插件的基本用法。`npm start`运行该程序后，观察命令行的输出，可以看到该插件帮你自动发起的action和相关的状态变化。

[与React、Fetch搭配使用](https://github.com/lewis617/redux-amrc/tree/master/examples/02-use-with-fetch)：一个简单的用户界面，点击load按钮，该插件会帮你获取“网络请求是否正在加载”、“网络请求是否加载完成”、“网络请求得到的数据是什么”等多个异步状态。该例子的运行方法同样是`npm start`。

## Star与Issue

如果您觉得该插件不错，就用[star](https://github.com/lewis617/redux-amrc)支持一下吧！如果您在使用该插件时遇到问题，请提交[Issue](https://github.com/lewis617/redux-amrc/issues)，我会第一时间解答您的疑问。
    
## License

MIT
