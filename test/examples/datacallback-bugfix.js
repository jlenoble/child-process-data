var childProcessData = require('../../build/src/index').default;
var spawn = require('child_process').spawn;

const gulpTest = gulpfile => {
  return childProcessData(spawn('gulp', [
    '--gulpfile',
    `build/${gulpfile}`,
    'subtest',
  ]));
};

gulpTest('gulpfile_gutil.log-special.js').then(res => {
  res.childProcess.kill();
  process.exit(0);
});
