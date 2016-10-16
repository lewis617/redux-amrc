import expect from 'expect';
import configureStore from 'redux-mock-store';
import { asyncMiddleware, ASYNC } from '../src';
import { load, loadSuccess, loadFail } from '../src/redux';

const middlewares = [asyncMiddleware];
const mockStore = configureStore(middlewares);

/**
 * This will dispatch LOAD and LOAD_SUCCESS,
 * state.[key] will be 'success'
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
 * This will dispatch LOAD and LOAD_FAIL,
 * loadState.[key].error will be 'fail'
 */
function fail() {
  return {
    [ASYNC]: {
      key: 'key',
      promise: () => Promise.reject('fail')
    }
  }
}

function noPromise(val) {
  return {
    [ASYNC]: {
      key: 'key',
      promise: () => val
    }
  }
}

describe('Async actions test', () => {
  it('Success should create Load and LOAD_SUCCESS actions and return Promise', () => {
    const expectedActions = [
      load('key'),
      loadSuccess('key', 'success')
    ];
    const store = mockStore();
    return store.dispatch(success())
      .then((action) => {
        expect(action).toEqual({ payload: { data: 'success', key: 'key' }, type: '@async/LOAD_SUCCESS' });
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
  it('Fail should create Load and LOAD_FAIL actions', () => {
    const expectedActions = [
      load('key'),
      loadFail('key', 'fail')
    ];
    const store = mockStore();
    return store.dispatch(fail())
      .then((action) => {
        expect(action).toEqual({ payload: { error: 'fail', key: 'key' }, type: '@async/LOAD_FAIL' });
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
  it('promise shouldn\'t return no-Promise', () => {
    const store = mockStore();
    try {
      store.dispatch(noPromise('str'))
    } catch (error) {
      expect(error.toString()).toEqual('Error: promise() must return Promise');
    }
  });
});
