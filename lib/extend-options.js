'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extendOptions;
function extendOptions(options, childProcess, resolve, reject) {
  var outMessages = [];
  var errMessages = [];
  var allMessages = [];

  options.result = { // eslint-disable-line no-param-reassign
    childProcess: childProcess, outMessages: outMessages, errMessages: errMessages, allMessages: allMessages,
    out: function out() {
      return this.outMessages.join('');
    },
    err: function err() {
      return this.errMessages.join('');
    },
    all: function all() {
      return this.allMessages.join('');
    },
    forget: function forget() {
      this.outMessages.length = 0;
      this.errMessages.length = 0;
      this.allMessages.length = 0;
    }
  };
  options.resolve = function () {
    // eslint-disable-line no-param-reassign
    resolve(options.result);
  };
  options.reject = reject; // eslint-disable-line no-param-reassign

  return options;
}
module.exports = exports['default'];