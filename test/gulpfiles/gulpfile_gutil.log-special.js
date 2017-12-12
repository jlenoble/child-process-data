var gulp = require('gulp');
var gutil = require('gulp-util');

const hello = function (done) {
  for (let i = 0; i < 5; i++) {
    gutil.log(`Test message ${i}: Hello!`);
  }
  done();
};

gulp.task('sub:te_st-tdd:transpile:all', function (done) {
  gulp.watch('gulpfile_gutil.log-special.js', hello);
  hello(done);
});

gulp.task('subtest', gulp.parallel('sub:te_st-tdd:transpile:all'));

gulp.task('default', gulp.parallel('sub:te_st-tdd:transpile:all'));
