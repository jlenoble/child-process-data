var gulp = require('gulp');
var gutil = require('gulp-util');

const hello = function () {
  for (let i = 0; i < 5; i++) {
    gutil.log(`Test message ${i}: Hello!`);
  }
};

gulp.task('subtest', function (done) {
  hello();
  done();
});

gulp.task('default', gulp.parallel('subtest'));
