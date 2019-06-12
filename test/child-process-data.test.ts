import childProcessData, { Result } from "../src/index";
import { spawn } from "child_process";
import { expect } from "chai";
import deepKill from "deepkill";

describe("Testing childProcessData", (): void => {
  const echo = (text: string): Promise<Result> => {
    return childProcessData(spawn("echo", [text]));
  };

  const gulpTest = (gulpfile: string): Promise<Result> => {
    return childProcessData(
      spawn("gulp", ["--gulpfile", `build/${gulpfile}`, "subtest"])
    );
  };

  it(`childProcessData can capture one-time outputs`, (): Promise<
    [void, void]
  > => {
    return Promise.all([
      echo("Little silly message").then((res): void => {
        expect(res.all()).to.equal("Little silly message\n");
      }),
      echo("Another little silly message").then((res): void => {
        expect(res.all()).to.equal("Another little silly message\n");
      })
    ]);
  });

  it(`childProcessData can capture continuous outputs`, async function(): Promise<
    void
  > {
    this.timeout(3000); // eslint-disable-line no-invalid-this
    let res: Result;

    try {
      res = await gulpTest("gulpfile_gutil.log.js");
    } catch (e) {
      return deepKill(e.result.pid);
    }

    try {
      const all = res.all();

      expect(all).to.match(/Working directory changed to.*child-process-data/);
      expect(all).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
      expect(all).to.match(/Starting 'subtest'/);
      expect(all).to.match(/Test message \d: Hello!/);
      expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
    } catch (e) {
      return deepKill(res.pid).then((): void => {
        throw e;
      });
    }

    return deepKill(res.pid);
  });

  it(`childProcessData can capture continuous outputs - special`, async function(): Promise<
    void
  > {
    this.timeout(3000); // eslint-disable-line no-invalid-this
    let res: Result;

    try {
      res = await gulpTest("gulpfile_gutil.log-special.js");
    } catch (e) {
      return deepKill(e.result.pid);
    }

    try {
      const all = res.all();

      expect(all).to.match(/Working directory changed to.*child-process-data/);
      expect(all).to.match(/Using gulpfile.*child-process-data.*gutil\.log/);
      expect(all).to.match(/Starting 'subtest'/);
      expect(all).to.match(/Starting 'sub:te_st-tdd:transpile:all'/);
      expect(all).to.match(/Test message \d: Hello!/);
      expect(all).to.match(
        /Finished 'sub:te_st-tdd:transpile:all' after (\d+\.?\d*) m?s/
      );
      expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
    } catch (e) {
      return deepKill(res.pid).then((): void => {
        throw e;
      });
    }

    return deepKill(res.pid);
  });

  it(`childProcessData can capture uncaught errors`, async function(): Promise<
    void
  > {
    this.timeout(3000); // eslint-disable-line no-invalid-this

    try {
      await gulpTest("gulpfile_gulp-error.js");
    } catch (e) {
      const err = e.message;
      const all = e.result.all();
      console.log(err);
      expect(err).to.match(/child process stream closed with code 1/);
      expect(all).to.match(/Working directory changed to.*child-process-data/);
      expect(all).to.match(/Using gulpfile.*child-process-data.*gulp-error/);
      expect(all).to.match(/Starting 'subtest'/);
      expect(all).to.match(/Error in plugin 'gulp-error'/);
      expect(all).to.match(
        /Intentional error when processing.*child-process-data/
      );
      return;
    }

    throw new Error("No uncaught error were captured");
  });

  it(`childProcessData can capture caught errors`, async function(): Promise<
    void
  > {
    this.timeout(3000); // eslint-disable-line no-invalid-this
    let res: Result;

    try {
      res = await gulpTest("gulpfile_gulp-error_plumber.js");
    } catch (e) {
      throw new Error("No caught error were captured");
    }

    const all = res.all();

    expect(all).to.match(/Working directory changed to.*child-process-data/);
    expect(all).to.match(/Using gulpfile.*child-process-data.*plumber/);
    expect(all).to.match(/Starting 'subtest'/);
    expect(all).to.match(
      /Intentional error when processing.*child-process-data/
    );
    expect(all).to.match(/Finished 'subtest' after/);
  });
});
