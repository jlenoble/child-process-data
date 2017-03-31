var gulp = require('gulp');
var error = require('gulp-error');
var plumber = require('gulp-plumber');

gulp.task('subtest', function () {
  return gulp.src(['src/*.js', 'test/*.js'])
    .pipe(plumber())
    .pipe(error('src/child-process-data.js'));
});

gulp.task('default', gulp.parallel('subtest'));
