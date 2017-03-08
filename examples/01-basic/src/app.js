import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { asyncMiddleware, reducerCreator, ASYNC } from 'redux-amrc';
import createLogger from 'redux-logger';

// 配置reducer
const rootReducer = combineReducers({
  async: reducerCreator()
});

// 配置logger：去除颜色，将state转化为字符串显示
const logger = createLogger({
  colors: { title: false },
  stateTransformer: (state) => JSON.stringify(state)
});

// 创建store
const store = createStore(rootReducer, applyMiddleware(thunk, asyncMiddleware, logger));


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

store.dispatch(success())
  .then(() => {
    store.dispatch(fail());
  });


