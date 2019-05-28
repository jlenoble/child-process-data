const gulp = require("gulp");
const log = require("fancy-log");

const hello = function() {
  for (let i = 0; i < 5; i++) {
    log(`Test message ${i}: Hello!`);
  }
};

gulp.task("subtest", done => {
  hello();
  done();
});

gulp.task("default", gulp.parallel("subtest"));
