var gulp = require('gulp');
var gutil = require('gulp-util');

const hello = function (done) {
  for (let i = 0; i < 5; i++) {
    gutil.log(`Test message ${i}: Hello!`);
  }
  done();
};

gulp.task('subtest', function (done) {
  gulp.watch('gulpfile_single-test.js', hello);
  hello(done);
});

gulp.task('default', gulp.parallel('subtest'));
