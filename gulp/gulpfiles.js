import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

import {buildDir, gulpfileDir, gulpGlob} from './globs';

export const setupGulpfiles = () => {
  return gulp.src(gulpGlob, {
    base: gulpfileDir,
    since: gulp.lastRun(setupGulpfiles)
  })
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(buildDir));
};

gulp.task('gulpfiles', setupGulpfiles);
