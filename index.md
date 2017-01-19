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

// 发起改action将会更新 `state.async.key` 上的数据
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
    
    
# English Document
     
This package will help you dispatch async action with less boilerplate.

## Install

```
npm install redux-amrc --save
```

## How to use

store/configureStore.js

```js
import { asyncMiddleware } from 'redux-amrc';
	
applyMiddleware(thunk, asyncMiddleware)

```

reducers/index.js

```js
import { combineReducers } from 'redux';
import { reducerCreator } from 'redux-amrc';

const rootReducer = combineReducers({
  async: reducerCreator()
});

export default rootReducer;
```

actions/index.js

```js
import { ASYNC } from 'redux-amrc';

/**
 * This actionCreator will create LOAD and LOAD_SUCCESS,
 * state.async.[key] will be 'success'
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
 * This actionCreator will create LOAD and LOAD_FAIL,
 * state.async.loadState.[key].error will be 'fail'
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

If you want to add some code after async, you can just do this:

```
dispatch(success())
  .then((action) => {
    console.log(action); // { payload: { data: 'success', key: 'key' }, type: '@async/LOAD_SUCCESS' }
  });

dispatch(fail())
  .then((action) => {
    console.log(action); // { payload: { error: 'fail', key: 'key' }, type: '@async/LOAD_FAIL' }
  });
```

If you want to add some code before async, you should write another action creator, because one function should do one thing.

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
    }
  };
}

function loadDataIfNeeded() {
  return (dispatch, getState) => {
    if (!getState().async.data) {
      dispatch(loadData())
    }
  };
}

```

If you don't like writing load*IfNeeded function, you can use "once" option to load data if needed.

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
 
If you want to update data in in `state.async.[key]` with your own action and reducer, you should add `reducers` to `reducerCreator(reducers)`, `reducers` in `reducerCreator(reducers)` is same as `reducers` in `combineReducers(reducers)`:

```
// your own action type
const TOGGLE = 'TOGGLE';

// your own reducer
function keyReducer(state, action) {
  switch (action.type) {
    case TOGGLE:
      return state === 'success' ? 'fail' : 'success';
    default:
      return state
  }

}

// add reducers to reducerCreator
const rootReducer = combineReducers({
  async: reducerCreator({
    key: keyReducer
  })
});

// This will toggle data in `state.async.key`
dispatch({ type: TOGGLE }); 
```

## How to test

If your action creator is like this:

```
function loadData() {
  return {
    [ASYNC]: {
      key: 'data',
      promise: () => fetch('http://localhost:3000/api/data')
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
    }
  };
}
```

The test should be like this:

```
import expect from 'expect';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncMiddleware } from 'redux-amrc';
import { load, loadSuccess } from 'redux-amrc/lib/redux';
import nock from 'nock';
import { loadData } from '../your_action_file';

const middlewares = [thunk, asyncMiddleware];
const mockStore = configureStore(middlewares);
const data = { value: 'data' };

function setup(state = {}) {
  nock('http://localhost:3000')
    .get('/api/dga')
    .reply(200, data);
  return mockStore(state);
}

describe('data actions test', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  it('loadData should create Load and LOAD_SUCCESS actions and return Promise', () => {
    const expectedActions = [
      load('data'),
      loadSuccess('data', data)
    ];
    const store = setup();
    return store.dispatch(loadData())
      .then((action) => {
        expect(action).toEqual(loadSuccess('data', data));
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
});

```

## Action and state

* action
    * LOAD: data loading for particular key is started
    * LOAD_SUCCESS: data loading process successfully finished. You'll have data returned from promise
    * LOAD_FAIL: data loading process was failed. You'll have error returned from promise

* state
    * [key]: Data, returned from resolved promise
    * loadState.[key].loading: [key].loading 
    * loadState.[key].loaded: Identifies that promise was resolved
    * loadState.[key].error: Errors, returned from rejected promise
    * loadingNumber: Number of loading


## API

* `asyncMiddleware`: Redux Middleware

* `[ASYNC]`
    * `key`: String
    * `promise(store)`: Function => Promise
        * `store`(Option): Object
    * `once`: Bool
  
* `reducerCreator(reducers)`: Function => Reducer
    * `reducers`(Option): Object
    
## License

MIT
