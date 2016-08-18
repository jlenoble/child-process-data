import childProcessData from '../src/child-process-data';
import {spawn} from 'child_process';
import {expect} from 'chai';

describe('Testing childProcessData', function() {

  const echo = (...args) => {
    return childProcessData(spawn('echo', args));
  };

  const gulpTest = gulpfile => {
    return childProcessData(spawn('gulp', [
      '--gulpfile',
      `build/${gulpfile}`,
      'subtest'
    ]));
  };

  it(`childProcessData can capture one-time outputs`, function() {
    return Promise.all([
      echo('Little silly message').then(res => {
        expect(res.all()).to.equal('Little silly message\n');
      }),
      echo('Another little silly message').then(res => {
        expect(res.all()).to.equal('Another little silly message\n');
      })
    ]);
  });

  it(`childProcessData can capture continuous outputs`, function() {
    return gulpTest('gulpfile_gutil.log.js').then(res => {
      res = res.all();
      expect(res).to.match(/Working directory changed to.*child-process-data/);
      expect(res).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
      expect(res).to.match(/Starting 'subtest'/);
      expect(res).to.match(/Test message \d: Hello!/);
      expect(res).to.match(/Finished 'subtest'/);
    });
  });

  it(`childProcessData can capture uncaught errors`, function() {
    return gulpTest('gulpfile_gulp-error.js').catch(err => {
      err = err.message;
      expect(err).to.match(/child process stream closed with code 1/);
      expect(err).to.match(/Working directory changed to.*child-process-data/);
      expect(err).to.match(/Using gulpfile.*child-process-data.*gulp-error/);
      expect(err).to.match(/Starting 'subtest'/);
      expect(err).to.match(/Error in plugin 'gulp-error'/);
      expect(err).to.match(/Intentional error when processing.*child-process-data/);
    });
  });

  it(`childProcessData can capture caught errors`, function() {
    return gulpTest('gulpfile_gulp-error_plumber.js').then(res => {
      res = res.all();
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
