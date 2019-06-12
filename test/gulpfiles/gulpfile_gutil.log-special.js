/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const log = require("fancy-log");

const hello = function(done) {
  for (let i = 0; i < 5; i++) {
    log(`Test message ${i}: Hello!`);
  }
  done();
};

gulp.task("sub:te_st-tdd:transpile:all", done => {
  gulp.watch("gulpfile_gutil.log-special.js", hello);
  hello(done);
});

gulp.task("subtest", gulp.parallel("sub:te_st-tdd:transpile:all"));

gulp.task("default", gulp.parallel("sub:te_st-tdd:transpile:all"));
