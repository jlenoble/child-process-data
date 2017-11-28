'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.makeIOTest = makeIOTest;

var _child_process = require('child_process');

var _chai = require('chai');

var _childProcessData = require('./child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

var _makeSingleTest = require('./make-single-test');

var _deepkill = require('deepkill');

var _deepkill2 = _interopRequireDefault(_deepkill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeIOTest(options) {
  var opts = (0, _assign2.default)({
    childProcessFile: null,
    childProcessOptions: [],
    waitForReady: 300,
    waitForAnswer: 50,

    checkStdio: function checkStdio() {
      // IO streams must be piped!
      if (this.childProcess.stdin === null) {
        throw new ReferenceError('Parent/child stdins not piped');
      }

      if (this.childProcess.stdout === null) {
        throw new ReferenceError('Parent/child stdouts not piped');
      }

      if (this.childProcess.stderr === null) {
        throw new ReferenceError('Parent/child stderrs not piped');
      }
    },
    spawnTest: function spawnTest() {
      if (!this.childProcessFile) {
        throw new ReferenceError('childProcessFile should be defined; will be passed to node');
      }

      if (!Array.isArray(this.childProcessOptions)) {
        if (typeof this.childProcessOptions !== 'string') {
          throw new TypeError('Bad childProcessOptions; must be string or array of strings');
        }

        this.childProcessOptions = [this.childProcessOptions];
      }

      var p = (0, _child_process.spawn)('node', [this.childProcessFile].concat((0, _toConsumableArray3.default)(this.childProcessOptions)), { stdio: 'pipe' });

      this.childProcess = p;

      // Ignore the returned promise, it will never be resolved.
      // The child process will continue running until this process exits.
      // But the promise has a prop results that is the object that should
      // be returned, would the childProcess close.
      this.results = (0, _childProcessData2.default)(p).results;
    },
    tearDownTest: function tearDownTest() {
      if (this.childProcess.stdin) {
        // May not have been opened in parent
        this.childProcess.stdin.pause();
      }
      (0, _deepkill2.default)(this.childProcess.pid);
      return _promise2.default.resolve();
    },
    onTearDownError: function onTearDownError(err) {
      // Last attempt at cleaning up: all errors pass through this last method
      if (this.childProcess) {
        if (this.childProcess.stdin) {
          // May not have been opened in parent
          this.childProcess.stdin.pause();
        }
        (0, _deepkill2.default)(this.childProcess.pid);
      }
      return _promise2.default.reject(err);
    }
  }, options);

  if (opts.childProcess) {
    // Override default spawnTest function but check if child has proper piping
    opts.spawnTest = function () {
      if (Array.isArray(this.childProcess)) {
        var _childProcess = (0, _slicedToArray3.default)(this.childProcess, 3);

        cmd = _childProcess[0];
        args = _childProcess[1];
        _options = _childProcess[2];


        if (_options && _options.stdio) {
          if (_options.stdio !== 'pipe' && Array.isArray(_options.stdio)) {
            if (!_options.stdio.every(function (opt) {
              return opt === 'pipe';
            })) {
              throw new Error('Bad stdio option, must be \'pipe\'');
            }
          }
        }

        this.childProcess = (0, _child_process.spawn)(cmd, args, _options || { stdio: 'pipe' });
      }

      this.checkStdio();

      // Ignore the returned promise, it will never be resolved.
      // The child process will continue running until this process exits.
      // But the promise has a prop results that is the object that should
      // be returned, would the childProcess close.
      this.results = (0, _childProcessData2.default)(this.childProcess).results;
    };
  }

  if (opts.messages) {
    opts.checkResults = function (results) {
      var _this = this;

      var outs = [];
      var errs = [];
      var stdin = this.childProcess.stdin;

      var check = function check() {
        (0, _chai.expect)(results.outMessages.join('')).to.equal(outs.join(''));
        (0, _chai.expect)(results.errMessages.join('')).to.equal(errs.join(''));
      };

      return new _promise2.default(function (resolve) {
        // Waiting for child to be online
        setTimeout(resolve, _this.waitForReady);
      })

      // Having a conversation
      .then(function () {
        return new _promise2.default(function (resolve, reject) {
          var i = 0;

          var intervalId = setInterval(function () {
            try {
              if (i >= opts.messages.length) {
                clearInterval(intervalId);
                return resolve();
              }

              var msg = opts.messages[i];

              var _Object$keys = (0, _keys2.default)(msg),
                  _Object$keys2 = (0, _slicedToArray3.default)(_Object$keys, 1),
                  scheme = _Object$keys2[0];

              var inMsg = void 0;
              var outMsg = void 0;

              if (i > 0) {
                check();
              }

              switch (scheme) {
                case 'i':
                  inMsg = msg[scheme];
                  stdin.write(inMsg + '\r');
                  break;

                case 'o':
                  outMsg = msg[scheme];
                  outs.push(outMsg);
                  break;

                case 'e':
                  outMsg = msg[scheme];
                  errs.push(outMsg);
                  break;

                case 'io':
                  var _msg$scheme = (0, _slicedToArray3.default)(msg[scheme], 2);

                  inMsg = _msg$scheme[0];
                  outMsg = _msg$scheme[1];

                  stdin.write(inMsg + '\r');
                  outs.push(outMsg);
                  break;

                case 'ie':
                  var _msg$scheme2 = (0, _slicedToArray3.default)(msg[scheme], 2);

                  inMsg = _msg$scheme2[0];
                  outMsg = _msg$scheme2[1];

                  stdin.write(inMsg + '\r');
                  errs.push(outMsg);
                  break;

                default:
                  throw new Error('Unsupported IO scheme: ' + scheme);
              }
            } catch (err) {
              clearInterval(intervalId);
              return reject(err);
            }

            i++;
          }, _this.waitForAnswer);
        });
      })

      // Test last return
      .then(function () {
        return new _promise2.default(function (resolve, reject) {
          setTimeout(function () {
            try {
              check();
              return resolve();
            } catch (err) {
              return reject(err);
            }
          }, _this.waitForAnswer);
        });
      });
    };
  }

  return (0, _makeSingleTest.makeSingleTest)(opts);
}