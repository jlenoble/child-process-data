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

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$included = _ref.included,
          included = _ref$included === undefined ? false : _ref$included;

      var pattern = message instanceof RegExp ? message : new RegExp(message.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'));
      var aIdx = -1;
      var remains = void 0;

      this.allMessages.some(function (msg, idx) {
        var match = msg.match(pattern);

        if (match) {
          aIdx = idx;
          remains = msg.substring(match.index + (included ? match[0].length : 0));

          if (remains) {
            if (msg === _this.outMessages[0]) {
              _this.outMessages[0] = remains;
            } else {
              _this.errMessages[0] = remains;
            }
          } else {
            if (included) {
              if (msg === _this.outMessages[0]) {
                _this.outMessages.shift();
              } else {
                _this.errMessages.shift();
              }
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

      this.allMessages.splice(0, included && !remains ? aIdx + 1 : aIdx);

      if (remains) {
        this.allMessages[0] = remains;
      }
    },
    test: function test(fn) {
      return this.multiTest(Array.isArray(fn) ? fn : [fn]);
    },
    multiTest: function multiTest(fns) {
      return this.allMessages.every(function (msg) {
        return fns.every(function (fn) {
          return fn(msg);
        });
      });
    },
    testUpTo: function testUpTo(fn, _msg, options) {
      return this.multiTestUpTo(Array.isArray(fn) ? fn : [fn], _msg, options);
    },
    multiTestUpTo: function multiTestUpTo(fns, _msg) {
      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$included = _ref2.included,
          included = _ref2$included === undefined ? false : _ref2$included;

      var pattern = _msg instanceof RegExp ? _msg : new RegExp(_msg.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'));

      var pat = void 0;
      var idx = -1;
      var ok = true;

      this.allMessages.every(function (msg, i) {
        pat = msg.match(pattern);
        if (pat) {
          idx = i;
          return false;
        }
        ok = fns.every(function (fn) {
          return fn(msg);
        });
        return ok;
      });

      // A test failed
      if (!ok) {
        return false;
      }

      // All tests succeeded and pattern was never found
      if (!pat) {
        return true;
      }

      // All tests succeeded until pattern was found: One last to go
      var m = this.allMessages[idx].substring(0, pat.index + (included ? pat[0].length : 0));
      return fns.every(function (fn) {
        return fn(m);
      });
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