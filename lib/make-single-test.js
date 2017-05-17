'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSingleTest = makeSingleTest;

var _child_process = require('child_process');

var _childProcessData = require('./child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
      return (0, _childProcessData2.default)(this.childProcess);
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