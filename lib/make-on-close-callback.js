"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeOnCloseCallback;
function makeOnCloseCallback(options, resolve, reject) {
  return function (code) {
    if (!code) {
      resolve(options.result);
    } else {
      var error = new Error("child process stream closed with code " + code);
      error.result = options.result;
      reject(error);
    }
  };
}
module.exports = exports["default"];