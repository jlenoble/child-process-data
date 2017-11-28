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
      var remains = void 0;

      this.allMessages.some(function (msg, idx) {
        var match = msg.match(pattern);

        if (match) {
          aIdx = idx;

          if (msg.length !== pattern.source.length) {
            remains = msg.substring(match.index + (included ? pattern.source.length : 0));
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
      var f = fn && typeof fn[Symbol.iterator] === 'function' ? fn : [fn];
      return this.multiTest(f);
    },
    multiTest: function multiTest(fns) {
      return this.allMessages.every(function (msg) {
        var ok = true;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = fns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var fn = _step.value;

            ok = fn(msg);
            if (!ok) {
              break;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return ok;
      });
    },
    testUpTo: function testUpTo(fn, _msg) {
      var f = fn && typeof fn[Symbol.iterator] === 'function' ? fn : [fn];
      return this.multiTestUpTo(f, _msg);
    },
    multiTestUpTo: function multiTestUpTo(fns, _msg) {
      var pattern = new RegExp(_msg);

      var pat = void 0;
      var ok = true;
      var idx = -1;

      this.allMessages.every(function (msg, i) {
        pat = msg.match(pattern);
        if (pat) {
          idx = i;
          return false;
        }
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = fns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var fn = _step2.value;

            ok = fn(msg);
            if (!ok) {
              break;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

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
      ok = true;
      var m = this.allMessages[idx].substring(0, pat.index);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = fns[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var fn = _step3.value;

          ok = fn(m);
          if (!ok) {
            break;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return ok;
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