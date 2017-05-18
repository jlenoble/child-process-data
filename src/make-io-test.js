import {spawn} from 'child_process';
import childProcessData from './child-process-data';
import {makeSingleTest} from './make-single-test';

export function makeIOTest (options) {
  const opts = Object.assign({
    childProcessFile: null,
    childProcessOptions: [],
    ioStrings: [],

    checkStdio () {
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

    spawnTest () {
      if (!this.childProcessFile) {
        throw new ReferenceError(
          'childProcessFile should be defined; will be passed to node');
      }

      if (!Array.isArray(this.childProcessOptions)) {
        if (typeof this.childProcessOptions !== 'string') {
          throw new TypeError(
            'Bad childProcessOptions; must be string or array of strings');
        }

        this.childProcessOptions = [this.childProcessOptions];
      }

      const p = spawn('node', [
        this.childProcessFile,
        ...this.childProcessOptions,
      ], {stdio: 'pipe'});

      this.childProcess = p;

      // Ignore the returned promise, it will never be resolved.
      // The child process will continue running until this process exits.
      // But the promise has a prop result that is the object that should
      // be returned, would the childProcess close.
      this.results = childProcessData(p).results;
    },
  }, options);

  if (opts.childProcess) {
    // Override default spawnTest function but check if child has proper piping
    opts.spawnTest = function () {
      if (Array.isArray(this.childProcess)) {
        [cmd, args, _options] = this.childProcess;

        if (_options && _options.stdio) {
          if (_options.stdio !== 'pipe' && Array.isArray(_options.stdio)) {
            if (!_options.stdio.every(opt => opt === 'pipe')) {
              throw new Error('Bad stdio option, must be \'pipe\'');
            }
          }
        }

        this.childProcess = spawn(cmd, args, _options || {stdio: 'pipe'});
      }

      this.checkStdio();

      // Ignore the returned promise, it will never be resolved.
      // The child process will continue running until this process exits.
      // But the promise has a prop result that is the object that should
      // be returned, would the childProcess close.
      this.results = childProcessData(this.childProcess).results;
    };
  }

  return makeSingleTest(opts);
}
