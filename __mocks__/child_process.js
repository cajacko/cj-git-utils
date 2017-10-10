/* eslint no-underscore-dangle: 0 require-jsdoc: 0 */
let response;
let callback;

export function __setResponse(newResponse) {
  response = newResponse;
}

export function __setCallback(newCallback) {
  callback = newCallback;
}

export function execSync(command) {
  if (callback) callback(command);

  return response;
}
