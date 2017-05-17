import Muter, {muted, captured} from 'muter';
import {spawn} from 'child_process';
import childProcessData from './child-process-data';

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

  // Instead wrap it to possibly mute it and handle ongoing child process
  opts.checkResults = (function (mute) {
    return function (results) {
      const muter = new Muter(process);

      // When child doesn't return, capture logs using muter and mock
      // results interface
      const muterToRes = () => {
        return {
          muter,

          out () {
            return this.muter.getLogs({
              logger: process.stdout,
              method: 'write',
            });
          },

          err () {
            return this.muter.getLogs({
              logger: process.stderr,
              method: 'write',
            });
          },

          all () {
            return this.muter.getLogs();
          },
        };
      };

      // If results exists, then child has returned, use its results,
      // else provide mockup based on Muter to deal with async messages
      const doCheck = results => {
        return checkResults.call(this, results || muterToRes());
      };

      // If child process has returned then muted/captured has no effect
      return (mute ? muted : captured)(muter, doCheck)(results);
    };
  }(opts.mute));

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
