var gulp = require('gulp');
var error = require('gulp-error');
var usePlumbedGulpSrc = require('plumb-gulp').usePlumbedGulpSrc;

usePlumbedGulpSrc();

gulp.task('subtest', function () {
  return gulp.src(['src/*.js', 'test/*.js'])
    .pipe(error('src/child-process-data.js'));
});

gulp.task('default', gulp.parallel('subtest'));
