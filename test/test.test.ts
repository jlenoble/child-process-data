import childProcessData, { Result } from "../src/index";
import { spawn } from "child_process";
import { expect } from "chai";

describe("Testing childProcessData", (): void => {
  const echo = (...args: string[]): Promise<Result> => {
    return childProcessData(spawn("echo", args));
  };

  const node = (...args: string[]): Promise<Result> => {
    return childProcessData(spawn("node", args));
  };

  it(`childProcessData can test buffered messages`, (): Promise<
    [void, void]
  > => {
    return Promise.all([
      echo("Little silly message").then((res): void => {
        expect(res.all()).to.equal("Little silly message\n");
        expect(res.test((msg): boolean => msg === "Little silly message\n")).to
          .be.true;
      }),
      echo("Another little silly message").then((res): void => {
        expect(res.all()).to.equal("Another little silly message\n");
        expect(
          res.test((msg): boolean => msg === "Another little silly message\n")
        ).to.be.true;
      })
    ]);
  });

  it(`childProcessData can multi-test buffered messages`, async (): Promise<
    void
  > => {
    const res = await echo("Little silly message");

    function make(str: string): (msg: string) => boolean {
      return (msg): boolean => msg.includes(str);
    }
    function* good(): IterableIterator<(msg: string) => boolean> {
      const a = ["Little", "silly", "message"].map(make);
      yield* a;
    }
    function* bad(): IterableIterator<(msg: string) => boolean> {
      const a = ["Little", "silly", "email"].map(make);
      yield* a;
    }

    expect(res.all()).to.equal("Little silly message\n");
    expect(res.multiTest([...good()])).to.be.true;
    expect(res.multiTest([...bad()])).to.be.false;
  });

  it(`childProcessData can test messages up to a point`, async (): Promise<
    void
  > => {
    const res = await node("./test/examples/normal-exit.js");
    expect(res.all()).to.equal("lorem\nipsum\ndolor\nsit\namet\n");
    expect(res.testUpTo((msg): boolean => !msg.includes("sit"), "dolor")).to.be
      .true;
    expect(res.testUpTo((msg): boolean => !msg.includes("ipsum"), "dolor")).to
      .be.false;
    expect(res.testUpTo((msg): boolean => !msg.includes("dolor"), "dolor")).to
      .be.true;
    expect(res.testUpTo((msg): boolean => !msg.includes("ip"), "sum")).to.be
      .false;
  });

  it(`childProcessData can multi-test messages up to a point`, async (): Promise<
    void
  > => {
    const res = await node("./test/examples/normal-exit.js");

    function make(str: string): (msg: string) => boolean {
      return (msg): boolean => !msg.includes(str);
    }
    function* good(): IterableIterator<(msg: string) => boolean> {
      const a = ["sit", "dolor"].map(make);
      yield* a;
    }
    function* bad(): IterableIterator<(msg: string) => boolean> {
      const a = ["sit", "dolor", "ipsum"].map(make);
      yield* a;
    }

    expect(res.all()).to.equal("lorem\nipsum\ndolor\nsit\namet\n");
    expect(res.testUpTo([...good()], "dolor")).to.be.true;
    expect(res.testUpTo([...bad()], "dolor")).to.be.false;
  });

  it(`childProcessData can multi-test messages up to a point, included`, async (): Promise<
    void
  > => {
    const res = await node("./test/examples/normal-exit.js");

    function make(str: string): (msg: string) => boolean {
      return (msg): boolean => !msg.includes(str);
    }
    function* good(): IterableIterator<(msg: string) => boolean> {
      const a = ["sit", "amet"].map(make);
      yield* a;
    }
    function* bad(): IterableIterator<(msg: string) => boolean> {
      const a = ["sit", "dolor"].map(make);
      yield* a;
    }

    expect(res.all()).to.equal("lorem\nipsum\ndolor\nsit\namet\n");
    expect(res.testUpTo([...good()], "dolor", { included: true })).to.be.true;
    expect(res.testUpTo([...bad()], "dolor", { included: true })).to.be.false;
  });

  it(`multi-test messages up to a point, included - special chars`, async (): Promise<
    void
  > => {
    const res = await node("./test/examples/queue-bugfix.js");

    function make(str: string): (msg: string) => boolean {
      return (msg): boolean => !msg.includes(str);
    }
    function* good(): IterableIterator<(msg: string) => boolean> {
      const a = [
        `Task 'transpile' (DST): tmp/src/gulptask.js`,
        `Task 'transpile' (NWR): 1 item`,
        `Task 'transpile' (DST): 1 item`,
        `Finished 'transpile' after 150 ms`,
        `Finished 'exec:transpile' after 150 ms`,
        `Finished 'default' after 150 ms`
      ].map(make);
      yield* a;
    }
    function* bad(): IterableIterator<(msg: string) => boolean> {
      const a = [
        `Task 'transpile' (DST): tmp/src/gulptask.js`,
        `Task 'transpile' (NWR): 1 item`,
        `Task 'transpile' (DST): 1 item`,
        `Task 'transpile' (NWR): tmp/src/gulptask.js`,
        `Finished 'transpile' after 150 ms`,
        `Finished 'exec:transpile' after 150 ms`,
        `Finished 'default' after 150 ms`
      ].map(make);
      yield* a;
    }

    expect(res.all()).to.equal(`Starting 'default'...
Starting 'exec:transpile'...
Starting 'exec:copy'...
Task 'copy' (SRC): src/gulptask.js
Task 'copy' (SRC): 1 item
Task 'copy' (NWR): src/gulptask.js
Task 'copy' (NWR): 1 item
Finished 'exec:copy' after 150 ms
Starting 'transpile'...
Task 'transpile' (SRC): tmp/src/gulptask.js
Task 'transpile' (SRC): 1 item
Task 'transpile' (NWR): tmp/src/gulptask.js
Task 'transpile' (DST): tmp/src/gulptask.js
Task 'transpile' (NWR): 1 item
Task 'transpile' (DST): 1 item
Finished 'transpile' after 150 ms
Finished 'exec:transpile' after 150 ms
Finished 'default' after 150 ms
`);

    expect(
      res.testUpTo([...good()], `Task 'transpile' (NWR): tmp/src/gulptask.js`, {
        included: true
      })
    ).to.be.true;
    expect(
      res.testUpTo([...bad()], `Task 'transpile' (NWR): tmp/src/gulptask.js`, {
        included: true
      })
    ).to.be.false;
  });
});
