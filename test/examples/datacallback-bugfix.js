const childProcessData = require("../../build/src/index").default;
const spawn = require("child_process").spawn;
const deepKill = require("deepkill");

const gulpTest = gulpfile => {
  return childProcessData(
    spawn("gulp", ["--gulpfile", `build/${gulpfile}`, "subtest"])
  );
};

gulpTest("gulpfile_gutil.log-special.js")
  .then(res => deepKill(res.childProcess.pid))
  .then(() => {
    process.exit(0);
  });
