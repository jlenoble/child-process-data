import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import jscs from 'gulp-jscs';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import del from 'del';
import path from 'path';

const originalSrc = gulp.src;
gulp.src = function() {
  return originalSrc.apply(gulp, arguments)
    .pipe(plumber({
      errorHandler: function(err) {
        console.error(err);
        this.emit('end');
      }
    }));
};

const buildDir = 'build';
const srcGlob = 'src/child-process-data.js';
const testSrcGlob = 'test/*.test.js';

const allSrcGlob = [srcGlob, testSrcGlob];
const testBuildGlob = path.join(buildDir, testSrcGlob);

const build = () => {
  return gulp.src(allSrcGlob, {base: process.cwd()})
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
};

const test = () => {
  return gulp.src(testBuildGlob)
    .pipe(mocha());
};

const watch = (done) => {
  gulp.watch(allSrcGlob, build);
  gulp.watch(testBuildGlob, test);
  done();
};

const dist = () => {
  return gulp.src(srcGlob)
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(babel())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('.'));
};

const clean = () => {
  return del(buildDir);
};

gulp.task('clean', clean);
gulp.task('build', build);
gulp.task('test', gulp.series('build', test));

gulp.task('watch', watch);
gulp.task('tdd', gulp.series('test', 'watch'));

gulp.task('dist', dist);
gulp.task('prepublish', gulp.series('test', 'clean', 'dist'));

gulp.task('default', gulp.parallel('tdd'));
