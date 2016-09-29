import { load, loadSuccess, loadFail } from './redux';
export const ASYNC = Symbol('async middleware');

export default store => next => action => {
  if (typeof action[ASYNC] === 'undefined') {
    return next(action);
  }
  const { key, promise } = action[ASYNC];

  if (typeof key !== 'string') {
    throw new Error('Specify a string key.');
  }

  if (!promise) {
    throw new Error('Specify one of the promise');
  }

  next(load(key));

  return promise(store)
    .then(data => next(loadSuccess(key, data)))
    .catch(error => next(loadFail(key, error.toString())));
};
