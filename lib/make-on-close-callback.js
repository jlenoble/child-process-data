'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeOnCloseCallback;
function makeOnCloseCallback(options, resolve, reject) {
  return function (code) {
    if (!code) {
      resolve(options.result);
    } else {
      var _options$result = options.result;
      var outMessages = _options$result.outMessages;
      var errMessages = _options$result.errMessages;
      var allMessages = _options$result.allMessages;

      var error = new Error('child process stream closed with code ' + code + '\n>>>>stdout buffer\n' + outMessages.join('') + '<<<<end stdout buffer\n>>>>stderr buffer\n' + errMessages.join('') + '<<<<end stderr buffer\n>>>>dual buffer\n' + allMessages.join('') + '<<<<end dual buffer');
      error.result = options.result;
      reject(error);
    }
  };
}
module.exports = exports['default'];