'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interceptMessage = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var interceptMessage = exports.interceptMessage = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(proc) {
    var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var regex, key, opts, results, countdown, lastCountdown;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            regex = toRegExp(msg);
            key = regex.source;
            opts = (0, _assign2.default)({
              dontBlock: true,
              listenTime: 30000,
              startDelay: 1,
              endDelay: 1
            }, options);
            results = (0, _childProcessData2.default)(proc, opts).results;
            countdown = Math.max(1, Math.ceil(opts.listenTime / interval));
            lastCountdown = Math.max(1, Math.ceil(opts.endDelay / interval));


            messages.set(key, { results: results, countdown: countdown, lastCountdown: lastCountdown });

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function interceptMessage(_x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.clearMessages = clearMessages;
exports.resolveMessage = resolveMessage;

var _childProcessData = require('./child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var messages = new _map2.default();
var interval = 500;
var panicTime = 10000;

function clearMessages() {
  messages.clear();
}

function toRegExp(msg) {
  var regex = msg;

  if (!(regex instanceof RegExp)) {
    regex = new RegExp(msg.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }

  return regex;
}

function resolveMessage(msg) {
  var regex = toRegExp(msg);
  var key = regex.source;
  var attempts = Math.ceil(panicTime / interval);
  var countdown = void 0;
  var lastCountdown = void 0;

  var fn = function fn() {
    return _promise2.default.resolve().then(function () {
      var _ref2 = messages.get(key) || {},
          results = _ref2.results;

      if (results) {
        if (countdown === undefined) {
          countdown = messages.get(key).countdown || 1;
          lastCountdown = messages.get(key).lastCountdown || 1;
        }

        if (results.all().match(regex) || ! --countdown) {
          if (countdown) {
            console.log('Intercepted message ' + regex);
          } else {
            throw new Error('Failed to intercept ' + regex);
          }

          if (--lastCountdown) {
            return new _promise2.default(function (resolve, reject) {
              setTimeout(function () {
                return fn().then(resolve, reject);
              }, interval);
            });
          }

          return;
        }
      } else {
        attempts--;

        if (!attempts) {
          throw new Error('Message ' + regex + ' still unregistered after ' + panicTime / 1000 + 's');
        }
      }

      return new _promise2.default(function (resolve, reject) {
        setTimeout(function () {
          return fn().then(resolve, reject);
        }, interval);
      });
    }).catch(function (err) {
      console.error(err.message);
      return err; // Don't throw but allow handling down the line
    });
  };

  Object.defineProperty(fn, 'name', { value: 'Waiting for message "' + (key.slice(0, 30) + '...') + '"' });

  return fn;
}