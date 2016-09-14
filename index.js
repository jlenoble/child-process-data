'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ChildProcess = (0, _child_process.spawn)('true').constructor;

function childProcessData(childProcess, options) {
  options = Object.assign({
    format: 'utf-8',
    dataCallbacks: {
      '(Starting) \'(\\w+)\'\\.\\.\\.': function StartingW(action, task) {
        console.log(action + ' \'' + _chalk2.default.cyan(task) + '\'...');
        options.dataUp();
      },
      '(Finished) \'(\\w+)\' after (\\d+\\.?\\d* m?s)': function FinishedWAfterDDMS(action, task, duration) {
        console.log(action + ' \'' + _chalk2.default.cyan(task) + '\' after ' + _chalk2.default.magenta(duration));
        options.dataDown();
      },
      '\\[(\\d\\d:\\d\\d:\\d\\d)\\]': function dDDDDD(time) {
        process.stdout.write('[' + _chalk2.default.gray(time) + '] ');
      },
      '(Working directory changed to|Using gulpfile) (.+)': function WorkingDirectoryChangedToUsingGulpfile(action, path) {
        console.log(action + ' ' + _chalk2.default.magenta(path));
      }
    },
    dataLevel: 0,
    dataUp: function dataUp() {
      options.dataLevel++;
    },
    dataDown: function dataDown() {
      options.dataLevel--;
      if (!options.dataLevel) {
        options.resolve();
      }
    }
  }, options);

  var dataCallbacks = [];
  Object.keys(options.dataCallbacks).forEach(function (key) {
    dataCallbacks.push({
      pattern: key,
      regexp: new RegExp(key),
      callback: options.dataCallbacks[key]
    });
  });

  var p = childProcess;
  var outMessages = [];
  var errMessages = [];
  var allMessages = [];

  if (!(p instanceof ChildProcess)) {
    throw new TypeError('Not a ChildProcess instance ' + p);
  }

  if (!p.stdout) {
    throw new ReferenceError('Undefined child process stdout');
  }

  if (!p.stderr) {
    throw new ReferenceError('Undefined child process stderr');
  }

  var promise = new Promise(function (resolve, reject) {

    options.result = {
      childProcess: childProcess, outMessages: outMessages, errMessages: errMessages, allMessages: allMessages,
      out: function out() {
        return this.outMessages.join('');
      },
      err: function err() {
        return this.errMessages.join('');
      },
      all: function all() {
        return this.allMessages.join('');
      }
    };
    options.resolve = function () {
      resolve(options.result);
    };
    options.reject = reject;

    p.stdout.on('data', function (data) {
      var str = data.toString(options.format);
      outMessages.push(str);
      allMessages.push(str);

      var found = false;

      dataCallbacks.some(function (obj) {
        var res = str.match(obj.regexp);
        if (res) {
          found = true;
          obj.callback(res[1], res[2], res[3], res[4]);
        }
        return found;
      });

      if (!found) {
        process.stdout.write(_chalk2.default.yellow(str));
      }
    });

    p.stderr.on('data', function (data) {
      var str = data.toString(options.format);
      errMessages.push(str);
      allMessages.push(str);
    });

    var callback = function callback(code) {
      if (!code) {
        resolve(options.result);
      } else {
        var error = new Error('child process stream closed with code ' + code + '\n>>>>stdout buffer\n' + outMessages.join('') + '<<<<end stdout buffer\n>>>>stderr buffer\n' + errMessages.join('') + '<<<<end stderr buffer\n>>>>dual buffer\n' + allMessages.join('') + '<<<<end dual buffer');
        error.result = options.result;
        reject(error);
      }
    };

    p.on('close', callback);
  });

  return promise;
}

exports.default = childProcessData;
module.exports = exports['default'];