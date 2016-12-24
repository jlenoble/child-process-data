'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extendOptions;
function extendOptions(options, childProcess, resolve, reject) {
  var outMessages = [];
  var errMessages = [];
  var allMessages = [];

  options.result = {
    childProcess: childProcess, outMessages: outMessages, errMessages: errMessages, allMessages: allMessages,
    out: function out() {
      return this.outMessages.join('');
    },
    err: function err() {
      return this.errMessages.join('');
    },
    all: function all() {
      return this.allMessages.join('');
    }
  };
  options.resolve = function () {
    resolve(options.result);
  };
  options.reject = reject;

  return options;
}
module.exports = exports['default'];