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
    },
    forgetUpTo: function forgetUpTo(message) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var pattern = message instanceof RegExp ? message : new RegExp(message);
      var included = options.included;

      var aIdx = -1;

      this.allMessages.some(function (msg, idx) {
        if (msg.match(pattern)) {
          aIdx = idx;

          if (included) {
            if (msg === _this.outMessages[0]) {
              _this.outMessages.shift();
            } else {
              _this.errMessages.shift();
            }
          }

          return true;
        }

        if (msg === _this.outMessages[0]) {
          _this.outMessages.shift();
        } else {
          _this.errMessages.shift();
        }

        return false;
      });

      if (aIdx === -1) {
        this.allMessages.length = 0;
        throw new Error('"' + message + '" not found in messages up till now');
      }

      this.allMessages.splice(0, included ? aIdx + 1 : aIdx);
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