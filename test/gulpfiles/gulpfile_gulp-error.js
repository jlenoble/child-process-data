/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const error = require("gulp-error");

gulp.task("subtest", () => {
  return gulp
    .src(["src/*.js", "test/*.js"])
    .pipe(error("src/child-process-data.js"));
});

gulp.task("default", gulp.parallel("subtest"));
