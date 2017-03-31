'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = childProcessData;
exports.makeSingleTest = makeSingleTest;

var _child_process = require('child_process');

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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

function makeSingleTest(options) {
  var opts = Object.assign({
    childProcess: null,
    setupTest: function setupTest() {
      return Promise.resolve();
    },
    onSetupError: function onSetupError(err) {
      return Promise.reject(err);
    },
    spawnTest: function spawnTest() {
      if (Array.isArray(this.childProcess)) {
        this.childProcess = _child_process.spawn.apply(undefined, _toConsumableArray(this.childProcess));
      }
      return childProcessData(this.childProcess);
    },
    onSpawnError: function onSpawnError(err) {
      return Promise.reject(err);
    },
    checkResults: function checkResults(results) {
      throw new Error('checkResults callback must be overridden');
    },
    onCheckResultsError: function onCheckResultsError(err) {
      return Promise.reject(err);
    },
    tearDownTest: function tearDownTest(results) {
      return Promise.resolve();
    },
    onTearDownError: function onTearDownError(err) {
      return Promise.reject(err);
    },
    onSuccess: function onSuccess() {
      return Promise.resolve();
    }
  }, options);

  if (opts.debug) {
    opts.debug = {};
    Object.keys(opts).forEach(function (key) {
      if (typeof opts[key] === 'function') {
        opts.debug[key] = opts[key];
        opts[key] = function () {
          var _debug$key;

          console.log('[makeSingleTest]', key);

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return (_debug$key = this.debug[key]).call.apply(_debug$key, [this].concat(args));
        };
      }
    });
  }

  return function (options) {
    return function () {
      return options.setupTest().then(function () {
        return options.spawnTest();
      }, function (err) {
        return options.onSetupError(err);
      }).then(function (results) {
        return options.checkResults(results);
      }, function (err) {
        return options.onSpawnError(err);
      }).then(function (results) {
        return options.tearDownTest(results);
      }, function (err) {
        return options.onCheckResultsError(err);
      }).then(function () {
        return options.onSuccess();
      }, function (err) {
        return options.onTearDownError(err);
      });
    };
  }(opts);
}