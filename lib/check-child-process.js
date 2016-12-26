'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChildProcess = undefined;
exports.default = checkChildProcess;

var _child_process = require('child_process');

var ChildProcess = exports.ChildProcess = (0, _child_process.spawn)('true').constructor;

function checkChildProcess(childProcess) {
  if (!(childProcess instanceof ChildProcess)) {
    throw new TypeError('Not a ChildProcess instance ' + childProcess);
  }

  if (!childProcess.stdout) {
    throw new ReferenceError('Undefined child process stdout');
  }

  if (!childProcess.stderr) {
    throw new ReferenceError('Undefined child process stderr');
  }

  return childProcess;
}