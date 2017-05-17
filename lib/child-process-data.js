'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

  var options = (0, _makeOptions2.default)(opts);
  var dataCallbacks = (0, _makeDataCallbacks2.default)(options.dataCallbacks);

  return new Promise(function (resolve, reject) {
    (0, _extendOptions2.default)(options, childProcess, resolve, reject);

    var format = options.format;
    var _options$result = options.result,
        outMessages = _options$result.outMessages,
        errMessages = _options$result.errMessages,
        allMessages = _options$result.allMessages;


    childProcess.stdout.on('data', (0, _makeOnDataCallback2.default)(format, outMessages, allMessages, dataCallbacks, 'stdout'));

    childProcess.stderr.on('data', (0, _makeOnDataCallback2.default)(format, errMessages, allMessages, dataCallbacks, 'stderr'));

    childProcess.on('close', (0, _makeOnCloseCallback2.default)(options, resolve, reject));
  });
}
module.exports = exports['default'];