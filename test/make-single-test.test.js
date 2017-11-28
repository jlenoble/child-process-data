import {makeSingleTest} from '../src/index';
import path from 'path';
import del from 'del';
import fse from 'node-fs-extra';
import {expect} from 'chai';

describe(`Testing makeSingleTest factory`, function () {
  it(`Default makeSingleTest() throws a 'Not a ChildProcess instance' error`,
    function () {
      const test = makeSingleTest();
      return test().catch(err => {
        expect(err).to.match(/Not a ChildProcess instance/);
      });
    });

  it(`makeSingleTest({
        childProcess: ['echo', ['Hello', 'World!']]
      }) throws a 'checkResults callback must be overridden' error`,
    function () {
      const test = makeSingleTest({
        childProcess: ['echo', ['Hello', 'World!']],
      });
      return test().catch(err => {
        expect(err).to.match(/checkResults callback must be overridden/);
      });
    });

  it(`makeSingleTest({
        childProcess: ['echo', ['Hello', 'World!']],
        checkResults: function (results) {
          expect(results.out()).to.equal('Hello World!\\n');
        }
      }) is Ok`, function () {
      const test = makeSingleTest({
        childProcess: ['echo', ['Hello', 'World!']],
        checkResults (results) {
          expect(results.out()).to.equal('Hello World!\n');
        },
      });
      return test();
    });

  it(`Testing gulp subprocess`, function () {
    this.timeout(5000); // eslint-disable-line no-invalid-this

    const file = 'gulpfile_single-test.js';
    const toFile = path.join('build', file);
    const fromFile = path.join('test/gulpfiles', file);

    const test = makeSingleTest({
      childProcess: ['gulp', ['--gulpfile', toFile]],
      setupTest () {
        return new Promise((resolve, reject) => {
          fse.copy(fromFile, toFile, function (err) {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
      },
      checkResults (results) {
        const all = results.all();
        expect(all).to.match(/Working directory changed to.*child-process-data/);
        expect(all).to.match(/Using gulpfile.*child-process-data.*single-test/);
        expect(all).to.match(/Starting 'subtest'/);
        expect(all).to.match(/Test message \d: Hello!/);
        expect(all).to.match(/Finished 'subtest'/);
        return results;
      },
      tearDownTest (results) {
        results.childProcess.kill();
        return del(toFile);
      },
    });
    return test();
  });

  it(`Testing gulp subprocess with debug option`, function () {
    this.timeout(5000); // eslint-disable-line no-invalid-this

    const file = 'gulpfile_single-test.js';
    const toFile = path.join('build', '_' + file);
    const fromFile = path.join('test/gulpfiles', file);

    const test = makeSingleTest({
      debug: true,
      childProcess: ['gulp', ['--gulpfile', toFile]],
      setupTest () {
        return new Promise((resolve, reject) => {
          fse.copy(fromFile, toFile, function (err) {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
      },
      checkResults (results) {
        const all = results.all();
        expect(all).to.match(/Working directory changed to.*child-process-data/);
        expect(all).to.match(/Using gulpfile.*child-process-data.*single-test/);
        expect(all).to.match(/Starting 'subtest'/);
        expect(all).to.match(/Test message \d: Hello!/);
        expect(all).to.match(/Finished 'subtest'/);
        return results;
      },
      tearDownTest (results) {
        results.childProcess.kill();
        return del(toFile);
      },
    });
    return test();
  });
});
