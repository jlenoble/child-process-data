const gulp = require("gulp");
const log = require("fancy-log");

const hello = function(done) {
  for (let i = 0; i < 5; i++) {
    log(`Test message ${i}: Hello!`);
  }
  done();
};

gulp.task("subtest", done => {
  gulp.watch("gulpfile_gutil.log.js", hello);
  hello(done);
});

gulp.task("default", gulp.parallel("subtest"));
