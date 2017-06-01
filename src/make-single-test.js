import {spawn} from 'child_process';
import childProcessData from './child-process-data';
import stripAnsi from 'strip-ansi';

export function makeSingleTest (options) {
  // Single test steps are immutable, but they don't need to be overridden,
  // except for checkResults (of course!), as they all return a sensible promise
  const opts = Object.assign({
    childProcess: null,

    setupTest () {
      return Promise.resolve();
    },

    onSetupError (err) {
      return Promise.reject(err);
    },

    spawnTest () {
      if (Array.isArray(this.childProcess)) {
        this.childProcess = spawn(...this.childProcess);
      }
      return childProcessData(this.childProcess);
    },

    onSpawnError (err) {
      // At this level, must reprocess error, as it is often terse (child
      // process returned with code 1), whereas err.result contains much
      // more information
      if (err.result) {
        const [message, ...stack] = stripAnsi(err.result.err() + '\n' +
          err.message + '\n' + err.stack).split('\n');
        const e = new Error(message);
        e.stack = stack.join('\n');
        return Promise.reject(e);
      } else {
        return Promise.reject(err);
      }
    },

    checkResults (results) {
      throw new Error('checkResults callback must be overridden');
    },

    onCheckResultsError (err) {
      return Promise.reject(err);
    },

    tearDownTest (results) {
      return Promise.resolve();
    },

    onTearDownError (err) {
      return Promise.reject(err);
    },

    onSuccess () {
      return Promise.resolve();
    },
  }, options);

  // Display (or not) debug messages at each testing step
  if (opts.debug) {
    opts.debug = {};
    Object.keys(opts).forEach(key => {
      if (typeof opts[key] === 'function') {
        opts.debug[key] = opts[key];
        opts[key] = function (...args) {
          console.log('[makeSingleTest]', key);
          return this.debug[key].call(this, ...args);
        };
      }
    });
  }

  // Don't pass directly user check function
  const checkResults = opts.checkResults;

  // Instead wrap it to handle ongoing child process
  opts.checkResults = function (results) {
    return checkResults.call(this, results || this.results);
  };

  // Generate single test function
  return (function (options) {
    return function () {
      return options.setupTest()
        .then(
          () => options.spawnTest(),
          err => options.onSetupError(err)
        )
        .then(
          results => options.checkResults(results),
          err => options.onSpawnError(err)
        )
        .then(
          results => options.tearDownTest(results),
          err => options.onCheckResultsError(err))
        .then(
          () => options.onSuccess(),
          err => options.onTearDownError(err)
        );
    };
  }(opts));
}
