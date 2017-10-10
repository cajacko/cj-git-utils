/* eslint no-underscore-dangle: 0 require-jsdoc: 0 */
let callback;

export function __setResponse(newCallback) {
  callback = newCallback;
}

export default function request(command) {
  return new Promise((resolve) => {
    if (callback) {
      callback(command);
    }

    resolve();
  });
}
