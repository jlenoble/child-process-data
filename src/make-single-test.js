import {spawn} from 'child_process';
import childProcessData from './child-process-data';

export function makeSingleTest (options) {
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
      return Promise.reject(err);
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

  return (function (options) {
    return function () {
      return options.setupTest()
        .then(() => options.spawnTest(), err => options.onSetupError(err))
        .then(results => options.checkResults(results), err =>
          options.onSpawnError(err))
        .then(results => options.tearDownTest(results), err =>
          options.onCheckResultsError(err))
        .then(() => options.onSuccess(), err => options.onTearDownError(err));
    };
  }(opts));
}
