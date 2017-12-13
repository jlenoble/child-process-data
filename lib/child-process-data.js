'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = childProcessData;

var _checkChildProcess = require('./check-child-process');

var _checkChildProcess2 = _interopRequireDefault(_checkChildProcess);

var _makeOptions = require('./make-options');

var _makeOptions2 = _interopRequireDefault(_makeOptions);

var _makeDataCallbacks = require('./make-data-callbacks');

var _makeDataCallbacks2 = _interopRequireDefault(_makeDataCallbacks);

var _extendOptions = require('./extend-options');

var _extendOptions2 = _interopRequireDefault(_extendOptions);

var _makeOnDataCallback = require('./make-on-data-callback');

var _makeOnDataCallback2 = _interopRequireDefault(_makeOnDataCallback);

var _makeOnCloseCallback = require('./make-on-close-callback');

var _makeOnCloseCallback2 = _interopRequireDefault(_makeOnCloseCallback);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function childProcessData(childProcess, opts) {
  (0, _checkChildProcess2.default)(childProcess);

  var options = (0, _makeOptions2.default)(opts, childProcessData);
  var dataCallbacks = (0, _makeDataCallbacks2.default)(options.dataCallbacks);

  var p = new _promise2.default(function (resolve, reject) {
    (0, _extendOptions2.default)(options, childProcess, resolve, reject);

    var format = options.format,
        silent = options.silent;
    var _options$result = options.result,
        outMessages = _options$result.outMessages,
        errMessages = _options$result.errMessages,
        allMessages = _options$result.allMessages;


    childProcess.stdout.on('data', (0, _makeOnDataCallback2.default)({
      format: format, allMessages: allMessages, dataCallbacks: dataCallbacks, silent: silent,
      messages: outMessages,
      std: 'stdout'
    }));

    childProcess.stderr.on('data', (0, _makeOnDataCallback2.default)({
      format: format, allMessages: allMessages, dataCallbacks: dataCallbacks, silent: silent,
      messages: errMessages,
      std: 'stderr'
    }));

    childProcess.on('close', (0, _makeOnCloseCallback2.default)(options, resolve, reject));
  });

  p.results = options.result;

  return p;
}

Object.defineProperty(childProcessData, 'silent', {
  value: false,
  writable: true
});

childProcessData.mute = function () {
  childProcessData.silent = true;
};

childProcessData.unmute = function () {
  childProcessData.silent = false;
};
module.exports = exports['default'];