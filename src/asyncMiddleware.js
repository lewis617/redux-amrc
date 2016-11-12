import { load, loadSuccess, loadFail } from './redux';
export const ASYNC = Symbol('async middleware');

export default store => next => action => {
  if (typeof action[ASYNC] === 'undefined') {
    return next(action);
  }
  const { key, promise, once } = action[ASYNC];

  const state = store.getState();

  if (once && state.async && state.async.loadState && state.async.loadState[key].loaded) {
    return Promise.resolve('No need to load ' + key);
  }

  if (typeof key !== 'string') {
    throw new Error('Specify a string key');
  }

  if (!promise) {
    throw new Error('Specify one of the promise');
  }

  const p = promise(store);

  if (!p || typeof p.then !== 'function') {
    throw new Error('promise() must return Promise');
  }

  next(load(key));

  return p
    .then(data => next(loadSuccess(key, data)))
    .catch(error => next(loadFail(key, error.toString())));
};
