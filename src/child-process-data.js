import {spawn} from 'child_process';
import checkChildProcess from './check-child-process';
import makeOptions from './make-options';
import makeDataCallbacks from './make-data-callbacks';
import extendOptions from './extend-options';
import makeOnDataCallback from './make-on-data-callback';
import makeOnCloseCallback from './make-on-close-callback';

export default function childProcessData (childProcess, opts) {
  checkChildProcess(childProcess);

  const options = makeOptions(opts);
  const dataCallbacks = makeDataCallbacks(options.dataCallbacks);

  return new Promise((resolve, reject) => {
    extendOptions(options, childProcess, resolve, reject);

    const {format} = options;
    const {outMessages, errMessages, allMessages} = options.result;

    childProcess.stdout.on('data', makeOnDataCallback(format, outMessages,
      allMessages, dataCallbacks, 'stdout'));
    childProcess.stderr.on('data', makeOnDataCallback(format, errMessages,
      allMessages, dataCallbacks, 'stderr'));
    childProcess.on('close', makeOnCloseCallback(options, resolve, reject));
  });
}

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
      opts.debug[key] = opts[key];

      if (typeof opts[key] === 'function') {
        opts[key] = function (...args) {
          console.log('[makeSingleTest]', key);
          return this.debug[key](...args);
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
