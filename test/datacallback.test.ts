import childProcessData from "../src/index";
import { spawn } from "child_process";
import { expect } from "chai";
import deepKill from "deepkill";

describe("Testing data callbacks", (): void => {
  it(`Testing Starting and Finished callbacks`, async (): Promise<void> => {
    const res = await childProcessData(
      spawn("node", ["./test/examples/datacallback-bugfix.js"])
    );

    const all = res.all();
    expect(all).to.match(/\[\d\d:\d\d:\d\d\] /);
    expect(all).to.match(/Working directory changed to.*child-process-data/);
    expect(all).to.match(/\Using gulpfile.*child-process-data.*gutil\.log/);
    expect(all).to.match(/Starting 'subtest'/);
    expect(all).to.match(/Starting 'sub:te_st-tdd:transpile:all'/);
    expect(all).to.match(/Test message \d: Hello!/);
    expect(all).to.match(
      /Finished 'sub:te_st-tdd:transpile:all' after (\d+\.?\d*) m?s/
    );
    expect(all).to.match(/Finished 'subtest' after (\d+\.?\d*) m?s/);
    return deepKill(res.childProcess.pid);
  });
});
