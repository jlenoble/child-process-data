import { MessageInterceptor, interceptMessage } from "../src/intercept-message";
import { spawn } from "child_process";
import { expect } from "chai";

describe("Testing interceptMessage & interceptMessage", function(): void {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  it("Capturing several messages", async (): Promise<void> => {
    const interceptor = new MessageInterceptor(
      spawn("node", ["./test/examples/normal-exit.js"])
    );

    const resolved = await Promise.all(
      ["lorem", "ipsum", "dolor", "sit", "amet"].map(
        (msg): Promise<boolean> => interceptor.interceptMessage(msg)
      )
    );

    expect(resolved).to.eql([true, true, true, true, true]);
  });

  it("Testing 3 resolvers resolving the same message", async (): Promise<
    void
  > => {
    const p = spawn("node", ["./test/examples/normal-exit.js"]);
    let msg = "dolor";

    const interceptor1 = new MessageInterceptor(p);
    const interceptor2 = new MessageInterceptor(p);
    const interceptor3 = new MessageInterceptor(p);

    let resolved = await Promise.all([
      interceptor1.interceptMessage(msg),
      interceptor2.interceptMessage(msg),
      interceptor3.interceptMessage(msg)
    ]);

    expect(resolved).to.eql([true, true, true]);

    msg = "amet";

    resolved = await Promise.all([
      interceptor1.interceptMessage(msg),
      interceptor2.interceptMessage(msg),
      interceptor3.interceptMessage(msg)
    ]);

    expect(resolved).to.eql([true, true, true]);
  });

  it("Testing interceptMessage", async (): Promise<void> => {
    const p = spawn("node", ["./test/examples/normal-exit.js"]);

    const found = Promise.all([
      interceptMessage(p, "ipsum"),
      interceptMessage(p, "sat"),
      interceptMessage(p, "amet")
    ]);

    expect(await found).to.be.eql([true, false, true]);
  });

  it("Testing endDelay", async (): Promise<void> => {
    // Fails when listen time is too short and listened process logs too late
    const p = spawn("node", ["./test/examples/normal-exit.js"]);

    const found = Promise.all([
      interceptMessage(p, "ipsum", { endDelay: 1000 }),
      interceptMessage(p, "sit", { endDelay: 500 }),
      interceptMessage(p, "amet", { endDelay: 0 })
    ]);

    expect(await found).to.be.eql([true, true, false]);
  });

  //   it(
  //     `Testing listenTime`,
  //     captured(muter, () => {
  //       // Fails when listen time is too short and listened process logs too late
  //
  //       return Promise.all(
  //         ["message 1", "message 2", "message 3"].map((msg, i) => {
  //           return Promise.all([
  //             new Promise((resolve, reject) => {
  //               setTimeout(() => {
  //                 interceptMessage(msg)()
  //                   .then(err => {
  //                     expect(err).to.be.undefined;
  //                   })
  //                   .then(resolve, reject);
  //               }, i * 2000);
  //             }),
  //             new Promise((resolve, reject) => {
  //               setTimeout(() => {
  //                 echo(msg, { listenTime: 500 }).then(resolve, reject);
  //               }, 1000);
  //             })
  //           ])
  //             .catch(err => {
  //               expect(err.message).to.match(/Failed to intercept \/message 1\//);
  //             })
  //             .then(() => {
  //               return new Promise((resolve, reject) => {
  //                 setTimeout(() => {
  //                   try {
  //                     expect(muter.getLogs({ logger: console, method: "log" })).to
  //                       .equal(`Intercepted message /message 2/
  // Intercepted message /message 3/
  // `);
  //                     expect(muter.getLogs({ logger: console, method: "error" }))
  //                       .to.equal(`Failed to intercept /message 1/
  // `);
  //                     resolve();
  //                   } catch (err) {
  //                     reject(err);
  //                   }
  //                 }, 4000);
  //               });
  //             });
  //         })
  //       );
  //     })
  //   );
  //
  //   it(
  //     `Testing startDelay`,
  //     captured(muter, () => {
  //       // When listened process takes too long to return, force resolve so that
  //       // it may be listened to on the fly instead of buffer
  //       return Promise.all(
  //         ["message 1", "message 2", "message 3"].map((msg, i) => {
  //           return Promise.all([
  //             new Promise((resolve, reject) => {
  //               setTimeout(() => {
  //                 interceptMessage(msg)()
  //                   .then(err => {
  //                     expect(err).to.be.undefined;
  //                   })
  //                   .then(resolve, reject);
  //               }, i * 2000);
  //             }),
  //             echo(msg, { startDelay: 1000, listenTime: 500 })
  //           ])
  //             .catch(err => {
  //               expect(err.message).to.match(/Failed to intercept \/message 1\//);
  //             })
  //             .then(() => {
  //               return new Promise((resolve, reject) => {
  //                 setTimeout(() => {
  //                   try {
  //                     expect(muter.getLogs({ logger: console, method: "log" })).to
  //                       .equal(`Intercepted message /message 2/
  // Intercepted message /message 3/
  // `);
  //                     expect(muter.getLogs({ logger: console, method: "error" }))
  //                       .to.equal(`Failed to intercept /message 1/
  // `);
  //                     resolve();
  //                   } catch (err) {
  //                     reject(err);
  //                   }
  //                 }, 4000);
  //               });
  //             });
  //         })
  //       );
  //     })
  //   );
});
