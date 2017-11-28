'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

exports.default = makeOnCloseCallback;

var _stripAnsi3 = require('strip-ansi');

var _stripAnsi4 = _interopRequireDefault(_stripAnsi3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeOnCloseCallback(options, resolve, reject) {
  return function (code) {
    if (!code) {
      resolve(options.result);
    } else {
      var _stripAnsi = (0, _stripAnsi4.default)(options.result.err().split('\n')),
          _stripAnsi2 = (0, _toArray3.default)(_stripAnsi),
          message = _stripAnsi2[0],
          stack = _stripAnsi2.slice(1);

      var error = new Error(message + ('\nchild process stream closed with code ' + code));
      error.stack = stack.join('\n');
      error.result = options.result;
      reject(error);
    }
  };
}
module.exports = exports['default'];