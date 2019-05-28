import childProcessData from "../src/index";
import { spawn } from "child_process";
import { expect } from "chai";
import deepKill from "deepkill";

describe("Testing childProcessData", (): void => {
  const echo = (text: string): Promise<any> => {
    return childProcessData(spawn("echo", [text]));
  };

  const gulpTest = (gulpfile: string): Promise<any> => {
    return childProcessData(
      spawn("gulp", ["--gulpfile", `build/${gulpfile}`, "subtest"])
    );
  };

  it(`childProcessData can capture one-time outputs`, (): Promise<
    [void, void]
  > => {
    return Promise.all([
      echo("Little silly message").then(
        (res): void => {
          expect(res.all()).to.equal("Little silly message\n");
        }
      ),
      echo("Another little silly message").then(
        (res): void => {
          expect(res.all()).to.equal("Another little silly message\n");
        }
      )
    ]);
  });

  it(`childProcessData can capture continuous outputs`, function(): Promise<
    any
  > {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest("gulpfile_gutil.log.js").then(
      (res): void => {
        const all = res.all();
        expect(all).to.match(
          /Working directory changed to.*child-process-data/
        );
        expect(all).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
        expect(all).to.match(/Starting 'subtest'/);
        expect(all).to.match(/Test message \d: Hello!/);
        expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
        return deepKill(res.childProcess.pid);
      }
    );
  });

  it(`childProcessData can capture continuous outputs - special`, function(): Promise<
    void
  > {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest("gulpfile_gutil.log-special.js").then(
      (res): Promise<void> => {
        const all = res.all();
        expect(all).to.match(
          /Working directory changed to.*child-process-data/
        );
        expect(all).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
        expect(all).to.match(/Starting 'subtest'/);
        expect(all).to.match(/Starting 'sub:te_st-tdd:transpile:all'/);
        expect(all).to.match(/Test message \d: Hello!/);
        expect(all).to.match(
          /Finished 'sub:te_st-tdd:transpile:all' after (\d+\.?\d*) m?s/
        );
        expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
        return deepKill(res.childProcess.pid);
      }
    );
  });

  it(`childProcessData can capture uncaught errors`, function(): Promise<void> {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest("gulpfile_gulp-error.js").catch(
      (_err): void => {
        const err = _err.message;
        const all = _err.result.all();
        console.log(err);
        expect(err).to.match(/child process stream closed with code 1/);
        expect(all).to.match(
          /Working directory changed to.*child-process-data/
        );
        expect(all).to.match(/Using gulpfile.*child-process-data.*gulp-error/);
        expect(all).to.match(/Starting 'subtest'/);
        expect(all).to.match(/Error in plugin 'gulp-error'/);
        expect(all).to.match(
          /Intentional error when processing.*child-process-data/
        );
      }
    );
  });

  it(`childProcessData can capture caught errors`, function(): Promise<void> {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    return gulpTest("gulpfile_gulp-error_plumber.js").then(
      (_res): void => {
        const res = _res.all();
        expect(res).to.match(
          /Working directory changed to.*child-process-data/
        );
        expect(res).to.match(/Using gulpfile.*child-process-data.*plumber/);
        expect(res).to.match(/Starting 'subtest'/);
        expect(res).to.match(
          /Intentional error when processing.*child-process-data/
        );
        expect(res).to.match(/Finished 'subtest' after/);
      }
    );
  });
});
