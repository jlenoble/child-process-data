'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.makeSingleTest = makeSingleTest;

var _child_process = require('child_process');

var _childProcessData = require('./child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeSingleTest(options) {
  // Single test steps are immutable, but they don't need to be overridden,
  // except for checkResults (of course!), as they all return a sensible promise
  var opts = (0, _assign2.default)({
    childProcess: null,

    setupTest: function setupTest() {
      return _promise2.default.resolve();
    },
    onSetupError: function onSetupError(err) {
      return _promise2.default.reject(err);
    },
    spawnTest: function spawnTest() {
      if (Array.isArray(this.childProcess)) {
        this.childProcess = _child_process.spawn.apply(undefined, (0, _toConsumableArray3.default)(this.childProcess));
      }
      return (0, _childProcessData2.default)(this.childProcess);
    },
    onSpawnError: function onSpawnError(err) {
      return _promise2.default.reject(err);
    },
    checkResults: function checkResults(results) {
      throw new Error('checkResults callback must be overridden');
    },
    onCheckResultsError: function onCheckResultsError(err) {
      return _promise2.default.reject(err);
    },
    tearDownTest: function tearDownTest(results) {
      return _promise2.default.resolve();
    },
    onTearDownError: function onTearDownError(err) {
      return _promise2.default.reject(err);
    },
    onSuccess: function onSuccess() {
      return _promise2.default.resolve();
    }
  }, options);

  // Display (or not) debug messages at each testing step
  if (opts.debug) {
    opts.debug = {};
    (0, _keys2.default)(opts).forEach(function (key) {
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

  // Don't pass directly user check function
  var checkResults = opts.checkResults;

  // Instead wrap it to handle ongoing child process
  opts.checkResults = function (results) {
    return checkResults.call(this, results || this.results);
  };

  // Generate single test function
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