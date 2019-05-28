import {spawn} from 'child_process';
import {expect} from 'chai';
import childProcessData from './child-process-data';
import {makeSingleTest} from './make-single-test';
import deepKill from 'deepkill';

export function makeIOTest (options) {
  const opts = Object.assign({
    childProcessFile: null,
    childProcessOptions: [],
    waitForReady: 300,
    waitForAnswer: 50,

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
      // But the promise has a prop results that is the object that should
      // be returned, would the childProcess close.
      this.results = childProcessData(p).results;
    },

    tearDownTest () {
      if (this.childProcess.stdin) { // May not have been opened in parent
        this.childProcess.stdin.pause();
      }
      deepKill(this.childProcess.pid);
      return Promise.resolve();
    },

    onTearDownError (err) {
      // Last attempt at cleaning up: all errors pass through this last method
      if (this.childProcess) {
        if (this.childProcess.stdin) { // May not have been opened in parent
          this.childProcess.stdin.pause();
        }
        deepKill(this.childProcess.pid);
      }
      return Promise.reject(err);
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
      // But the promise has a prop results that is the object that should
      // be returned, would the childProcess close.
      this.results = childProcessData(this.childProcess).results;
    };
  }

  if (opts.messages) {
    opts.checkResults = function (results) {
      const outs = [];
      const errs = [];
      const stdin = this.childProcess.stdin;

      const check = () => {
        expect(results.outMessages.join('')).to.equal(outs.join(''));
        expect(results.errMessages.join('')).to.equal(errs.join(''));
      };

      return new Promise(resolve => {
        // Waiting for child to be online
        setTimeout(resolve, this.waitForReady);
      })

      // Having a conversation
        .then(() => new Promise((resolve, reject) => {
          let i = 0;

          const intervalId = setInterval(() => {
            try {
              if (i >= opts.messages.length) {
                clearInterval(intervalId);
                return resolve();
              }

              const msg = opts.messages[i];
              const [scheme] = Object.keys(msg);
              let inMsg;
              let outMsg;

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
                [inMsg, outMsg] = msg[scheme];
                stdin.write(inMsg + '\r');
                outs.push(outMsg);
                break;

              case 'ie':
                [inMsg, outMsg] = msg[scheme];
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
          }, this.waitForAnswer);
        }))

        // Test last return
        .then(() => new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              check();
              return resolve();
            } catch (err) {
              return reject(err);
            }
          }, this.waitForAnswer);
        }));
    };
  }

  return makeSingleTest(opts);
}
