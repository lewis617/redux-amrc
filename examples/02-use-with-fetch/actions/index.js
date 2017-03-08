import fetch from 'isomorphic-fetch';
import { ASYNC } from 'redux-amrc';

export function load() {
  return {
    [ASYNC]: {
      key: 'users',
      promise: () => fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
    }
  };
}
