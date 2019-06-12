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

  it(`childProcessData can forget buffered messages`, (): Promise<
    [void, void]
  > => {
    return Promise.all([
      echo("Little silly message").then(
        (res): void => {
          expect(res.all()).to.equal("Little silly message\n");
          res.forget();
          expect(res.all()).to.equal("");
        }
      ),
      echo("Another little silly message").then(
        (res): void => {
          expect(res.all()).to.equal("Another little silly message\n");
          res.forget();
          expect(res.all()).to.equal("");
        }
      )
    ]);
  });

  it(`childProcessData can forget messages up to a point`, (): Promise<
    [void, void | Result]
  > => {
    return Promise.all([
      node("./test/examples/normal-exit.js").then(
        (res): void => {
          expect(res.out()).to.equal("lorem\nipsum\nsit\n");
          expect(res.err()).to.equal("dolor\namet\n");
          res.forgetUpTo("dolor\n", { included: true });
          expect(res.out()).to.equal("sit\n");
          expect(res.err()).to.equal("amet\n");
          expect(res.all()).to.equal("sit\namet\n");
        }
      ),
      node("./test/examples/error-exit.js").catch(
        (err): void => {
          const res = err.result;
          expect(res.out()).to.equal("lorem\nipsum\nsit\n");
          expect(res.err()).to.equal("dolor\n" + res._errMessages[1]);
          res.forgetUpTo("dolor\n");
          expect(res.out()).to.equal("sit\n");
          expect(res.err()).to.equal("dolor\n" + res._errMessages[1]);
          expect(res.all()).to.equal("dolor\nsit\n" + res._errMessages[1]);
        }
      )
    ]);
  });

  it(`childProcessData can forget messages up to a point - special chars`, async (): Promise<
    void
  > => {
    const res = await node("./test/examples/queue-bugfix.js");

    expect(res.out()).to.equal(`Starting 'default'...
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

    res.forgetUpTo(`Starting 'exec:transpile'...`, { included: true });

    expect(res.out()).to.equal(`
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

    res.forgetUpTo(`Starting 'exec:copy'...`, { included: true });

    expect(res.out()).to.equal(`
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

    res.forgetUpTo(`Task 'copy' (SRC): src/gulptask.js`, {
      included: true
    });

    expect(res.out()).to.equal(`
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

    res.forgetUpTo(`Task 'transpile' (NWR): 1 item`, { included: true });

    expect(res.out()).to.equal(`
Task 'transpile' (DST): 1 item
Finished 'transpile' after 150 ms
Finished 'exec:transpile' after 150 ms
Finished 'default' after 150 ms
`);
  });
});
