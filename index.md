# Redux async middleware and reducer creator

[![NPM Version](https://img.shields.io/npm/v/redux-amrc.svg?style=flat)](https://www.npmjs.com/package/redux-amrc)
[![Build Status](https://travis-ci.org/lewis617/redux-amrc.svg?branch=master)](https://travis-ci.org/lewis617/redux-amrc)
[![codecov](https://codecov.io/gh/lewis617/redux-amrc/branch/master/graph/badge.svg)](https://codecov.io/gh/lewis617/redux-amrc)
[![npm](https://img.shields.io/npm/dm/redux-amrc.svg?maxAge=2592000)](redux-amrc)
[![npm](https://img.shields.io/npm/l/redux-amrc.svg?maxAge=2592000)](redux-amrc)

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
