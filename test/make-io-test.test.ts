import { makeIOTest } from "../src/index";
import { delay } from "promise-plumber";
import { expect } from "chai";

describe(`Testing makeIOTest factory`, (): void => {
  it(`Default makeIOTest() throws a 'childProcessFile should be defined' error`, async (): Promise<
    void
  > => {
    const test = makeIOTest();

    return test().then(
      (): void => {
        throw new Error("Did not throw");
      },
      (err): void => {
        expect(err).to.match(/childProcessFile should be defined/);
      }
    );
  });

  it(`makeIOTest({
        childProcessFile: 'build/test/io/readline.js',
        checkResults: function (results) {...}
      }) is Ok`, async (): Promise<void> => {
    const test = makeIOTest({
      childProcessFile: "build/test/io/readline.js",

      async checkResults(results): Promise<void> {
        if (!results.childProcess) {
          throw new Error("Undefined child process");
        }

        await delay(300);

        const p = results.childProcess;
        const stdin = p.stdin;

        if (!stdin) {
          throw new Error("Undefined stdin");
        }

        stdin.write("Hello!\r");
        stdin.write("How are you?\r");
        stdin.write("Where do you live?\r");
        stdin.write("What do you do?\r");

        await delay(300);

        const out = results
          .out()
          .split("\n")
          .reduce(
            (arr, str): string[][] => {
              const last = arr[arr.length - 1];

              if (last.length < 2) {
                last.push(str);
              } else {
                arr.push([str]);
              }

              return arr;
            },
            [[]] as string[][]
          );

        expect(out[0].join("\n")).to.equal("Hello!\n Hello!");
        expect(out[1].join("\n")).to.equal("How are you?\n Fine!");
        expect(out[2].join("\n")).to.equal("Where do you live?\n On Github.");
        expect(out[3].join("\n")).to.equal(
          "What do you do?\n I dont't speak to strings!"
        );

        stdin.write("exit");
      }
    });

    return test();
  });

  it(`makeIOTest({
        childProcessFile: 'build/test/io/readline.js',
        io: [...]
      }) is Ok`, (): Promise<void> => {
    const test = makeIOTest({
      childProcessFile: "build/test/io/readline.js",
      timeout: 1000,

      messages: [
        { io: ["Hello!", "Hello!\n Hello!\n"] },
        { io: ["How are you?", "How are you?\n Fine!\n"] },
        { io: ["Where do you live?", "Where do you live?\n On Github.\n"] },
        {
          io: [
            "What do you do?",
            "What do you do?\n I dont't speak to strings!\n"
          ]
        }
      ]
    });

    return test();
  });
});
