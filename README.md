# Redux async middleware and reducer creator

[![NPM Version](https://img.shields.io/npm/v/redux-amrc.svg?style=flat)](https://www.npmjs.com/package/redux-amrc)
[![Build Status](https://travis-ci.org/lewis617/redux-amrc.svg?branch=master)](https://travis-ci.org/lewis617/redux-amrc)
[![codecov](https://codecov.io/gh/lewis617/redux-amrc/branch/master/graph/badge.svg)](https://codecov.io/gh/lewis617/redux-amrc)

This package wil help you dispatch async action with less boilerplate.

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
 * state.async[key] will be 'success'
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
    * `promise`: Function => Promise
        * `store`(Option): Object
  
* `reducerCreator`: Function => Reducer
    * `reducers`(Option): Object
    
> `reducers` is same as `reducers` in `combineReducers(reducers)`, it is used
to update data in `state.async.[key]`.

## License

MIT
