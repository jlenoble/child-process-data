import childProcessData from '../src/index';
import {spawn} from 'child_process';
import {expect} from 'chai';

describe('Testing childProcessData', function () {
  const echo = (...args) => {
    return childProcessData(spawn('echo', args));
  };

  const gulpTest = gulpfile => {
    return childProcessData(spawn('gulp', [
      '--gulpfile',
      `build/${gulpfile}`,
      'subtest',
    ]));
  };

  it(`childProcessData can capture one-time outputs`, function () {
    return Promise.all([
      echo('Little silly message').then(res => {
        expect(res.all()).to.equal('Little silly message\n');
      }),
      echo('Another little silly message').then(res => {
        expect(res.all()).to.equal('Another little silly message\n');
      }),
    ]);
  });

  it(`childProcessData can capture continuous outputs`, function () {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest('gulpfile_gutil.log.js').then(res => {
      const all = res.all();
      expect(all).to.match(/Working directory changed to.*child-process-data/);
      expect(all).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
      expect(all).to.match(/Starting 'subtest'/);
      expect(all).to.match(/Test message \d: Hello!/);
      expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
      res.childProcess.kill();
    });
  });

  it(`childProcessData can capture continuous outputs - special`, function () {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest('gulpfile_gutil.log-special.js').then(res => {
      const all = res.all();
      expect(all).to.match(/Working directory changed to.*child-process-data/);
      expect(all).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
      expect(all).to.match(/Starting 'subtest'/);
      expect(all).to.match(/Starting 'sub:te_st-tdd:transpile:all'/);
      expect(all).to.match(/Test message \d: Hello!/);
      expect(all).to.match(
        /Finished 'sub:te_st-tdd:transpile:all' after (\d+\.?\d*) m?s/);
      expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
      res.childProcess.kill();
    });
  });

  it(`childProcessData can capture uncaught errors`, function () {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest('gulpfile_gulp-error.js').catch(_err => {
      const err = _err.message;
      const all = _err.result.all();
      console.log(err);
      expect(err).to.match(/child process stream closed with code 1/);
      expect(all).to.match(/Working directory changed to.*child-process-data/);
      expect(all).to.match(/Using gulpfile.*child-process-data.*gulp-error/);
      expect(all).to.match(/Starting 'subtest'/);
      expect(all).to.match(/Error in plugin 'gulp-error'/);
      expect(all).to.match(/Intentional error when processing.*child-process-data/);
    });
  });

  it(`childProcessData can capture caught errors`, function () {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest('gulpfile_gulp-error_plumber.js').then(_res => {
      const res = _res.all();
      expect(res).to.match(/Working directory changed to.*child-process-data/);
      expect(res).to.match(/Using gulpfile.*child-process-data.*plumber/);
      expect(res).to.match(/Starting 'subtest'/);
      expect(res).to.match(/Plumber found unhandled error:/);
      expect(res).to.match(/Error in plugin 'gulp-error'/);
      expect(res).to.match(/Intentional error when processing.*child-process-data/);
      expect(res).to.match(/The following tasks did not complete: subtest/);
      expect(res).to.match(/Did you forget to signal async completion?/);
    });
  });
});
