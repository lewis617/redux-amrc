import expect from 'expect';
import configureStore from 'redux-mock-store';
import { asyncMiddleware, ASYNC } from '../src';
import reducerCreator, { load, loadSuccess, loadFail, initialState } from '../src/redux';

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


describe('Async actions test', () => {
  it('Success should create Load and LOAD_SUCCESS actions', () => {
    const expectedActions = [
      load('key'),
      loadSuccess('key', 'success')
    ];
    const store = mockStore();
    return store.dispatch(success())
      .then(() => {
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
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
});

describe('reducer test', () => {
  let state;
  let loadState;
  let reducer = reducerCreator();
  it('should handle initial state', () => {
    expect(reducer(undefined, {}).loadingNumber).toEqual(0);
  });

  it('should handle load', () => {
    loadState = reducer(initialState, load('key'));
    expect(loadState.loadState.key.error).toEqual(undefined);
    expect(loadState.loadState.key.loaded).toEqual(false);
    expect(loadState.loadState.key.loading).toEqual(true);
    expect(loadState.loadingNumber).toEqual(1);
  });

  it('should handle loadSuccess', () => {
    state = reducer(loadState, loadSuccess('key', 'success'));
    expect(state.loadState.key.loaded).toEqual(true);
    expect(state.loadState.key.loading).toEqual(false);
    expect(state.loadState.key.error).toEqual(null);
    expect(state.loadingNumber).toEqual(0);
    expect(state.key).toEqual('success');
  });

  it('should handle loadFail', () => {
    state = reducer(loadState, loadFail('key', 'fail'));
    expect(state.loadState.key.loading).toEqual(false);
    expect(state.loadState.key.error).toEqual('fail');
    expect(state.loadingNumber).toEqual(0);
  });


  const TOGGLE = 'TOGGLE';

  function keyReducer(state, action) {
    switch (action.type) {
      case TOGGLE:
        return state === 'success' ? 'fail' : 'success';
      default:
        return state
    }

  }

  reducer = reducerCreator({
    key: keyReducer
  });

  it('should handle TOGGLE', () => {
    state = reducer(loadState, { type: TOGGLE });
    expect(state.key).toEqual('success');
  });

});

