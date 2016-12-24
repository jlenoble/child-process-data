import gulp from 'gulp';
import del from 'del';

import {buildDir, distDir} from './globs';

export const clean = () => {
  return del([buildDir, distDir]);
};

gulp.task('clean', clean);
