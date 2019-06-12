import childProcessData, { Result } from "../src/index";
import { spawn } from "child_process";
import { expect } from "chai";

describe("Testing README.md examples", (): void => {
  it(`Testing 'Simple usage' example`, async (): Promise<void> => {
    const proc1 = spawn("echo", ["Lorem ipsum"]); // Spawns a child process
    const proc2 = spawn("echo", ["dolor sit amet"]); // Spawns another child
    // process

    const [res1, res2]: [Result, Result] = await Promise.all([
      childProcessData(proc1),
      childProcessData(proc2)
    ]);

    expect(res1.all()).to.equal("Lorem ipsum\n");
    expect(res2.all()).to.equal("dolor sit amet\n");
  });

  it(`Testing 'Accessing individual messages' example`, async (): Promise<
    void
  > => {
    const res: Result = await childProcessData(
      spawn("node", ["./test/examples/normal-exit.js"])
    );

    const outMessages = res.outMessages();
    const errMessages = res.errMessages();
    const allMessages = res.allMessages();

    expect(outMessages[0]).to.equal("lorem\n");
    expect(outMessages[1]).to.equal("ipsum\n");
    expect(outMessages[2]).to.equal("sit\n");
    expect(errMessages[0]).to.equal("dolor\n");
    expect(errMessages[1]).to.equal("amet\n");
    expect(allMessages).to.include("lorem\n");
    expect(allMessages).to.include("ipsum\n");
    expect(allMessages).to.include("dolor\n");
    expect(allMessages).to.include("sit\n");
    expect(allMessages).to.include("amet\n");
  });

  it(`Testing 'Accessing all messages' example`, async (): Promise<void> => {
    const res: Result = await childProcessData(
      spawn("node", ["./test/examples/normal-exit.js"])
    );

    expect(res.out()).to.equal("lorem\nipsum\nsit\n");
    expect(res.err()).to.equal("dolor\namet\n");
    ["lorem\n", "ipsum\n", "dolor\n", "sit\n", "amet\n"].forEach(
      (word): void => {
        expect(res.all()).to.match(new RegExp(word));
      }
    );
  });

  it(`Testing 'Accessing uncaught error messages' example`, async (): Promise<
    void
  > => {
    try {
      await childProcessData(spawn("node", ["./test/examples/error-exit.js"]));
    } catch (_err) {
      const res: Result = _err.result;

      const outMessages = res.outMessages();
      const errMessages = res.errMessages();
      const allMessages = res.allMessages();

      expect(outMessages[0]).to.equal("lorem\n");
      expect(outMessages[1]).to.equal("ipsum\n");
      expect(outMessages[2]).to.equal("sit\n");
      expect(errMessages[0]).to.equal("dolor\n");
      expect(errMessages[1]).to.match(/Error:.*amet/);
      expect(allMessages[0]).to.equal("lorem\n");
      expect(allMessages[1]).to.equal("ipsum\n");
      expect(allMessages[2]).to.equal("dolor\n");
      expect(allMessages[3]).to.equal("sit\n");
      expect(allMessages[4]).to.match(/Error:.*amet/);

      expect(res.out()).to.equal("lorem\nipsum\nsit\n");
      expect(res.err()).to.equal("dolor\n" + errMessages[1]);
      expect(res.all()).to.equal("lorem\nipsum\ndolor\nsit\n" + allMessages[4]);
    }
  });
});
