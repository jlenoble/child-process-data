'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var ChildProcess = (0, _child_process.spawn)('true').constructor;

function childProcessData(childProcess, options) {
  options || (options = {
    format: 'utf-8'
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

  p.stdout.on('data', function (data) {
    var str = data.toString(options.format);
    outMessages.push(str);
    allMessages.push(str);
  });

  p.stderr.on('data', function (data) {
    var str = data.toString(options.format);
    errMessages.push(str);
    allMessages.push(str);
  });

  var promise = new Promise(function (resolve, reject) {

    p.on('close', function (code) {
      if (!code) {
        resolve({
          childProcess: childProcess, outMessages: outMessages, errMessages: errMessages, allMessages: allMessages,
          out: function out() {
            return this.outMessages.join();
          },
          err: function err() {
            return this.errMessages.join();
          },
          all: function all() {
            return this.allMessages.join();
          }
        });
      } else {
        reject(new Error('child process stream closed with code ' + code));
      }

      console.log(allMessages.join());
    });
  });

  return promise;
}

exports.default = childProcessData;
module.exports = exports['default'];