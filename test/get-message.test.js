import {interceptMessage, resolveMessage, clearMessages} from '../src/index';
import {spawn} from 'child_process';
import {expect} from 'chai';
import Muter, {captured} from 'muter';

describe('Testing interceptMessage & resolveMessage', function () {
  this.timeout(20000); // eslint-disable-line no-invalid-this

  const echo = (msg, options) => {
    return interceptMessage(spawn('echo', [msg]), msg, options);
  };

  const muter = Muter(console); // eslint-disable-line new-cap

  beforeEach(clearMessages);
  afterEach(clearMessages);

  it(`Capturing several echo processes`, captured(muter, function () {
    return Promise.all([
      'message 1',
      'message 2',
      'message 3',
    ].map(msg => {
      return echo(msg).then(() => msg);
    })).then(messages => {
      return Promise.all(messages.reverse().map(msg => {
        return resolveMessage(msg)().then(err => {
          expect(err).to.be.undefined;
        });
      })).then(() => {
        expect(muter.getLogs()).to.equal(`Intercepted message /message 3/
Intercepted message /message 2/
Intercepted message /message 1/
`);
      });
    });
  }));

  // eslint-disable-next-line max-len
  it(`Testing 3 resolvers resolving the same message`, captured(muter, function () {
    return Promise.all([
      'message 1',
      'message 2',
      'message 3',
    ].map(msg => {
      return echo(msg).then(() => msg);
    })).then(messages => {
      return Promise.all(messages.reverse().map(msg => {
        return resolveMessage('message 1')().then(err => {
          expect(err).to.be.undefined;
        });
      })).then(() => {
        expect(muter.getLogs()).to.equal(`Intercepted message /message 1/
Intercepted message /message 1/
Intercepted message /message 1/
`);
      });
    });
  }));

  it(`Resolvers can be started any time`, captured(muter, function () {
    // because results are cached

    return Promise.all([
      'message 1',
      'message 2',
      'message 3',
    ].map(msg => {
      return echo(msg).then(() => msg);
    })).then(messages => {
      return Promise.all(messages.reverse().map((msg, i) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolveMessage(msg)().then(err => {
              expect(err).to.be.undefined;
            }).then(resolve, reject);
          }, i * 2000);
        });
      })).then(() => {
        expect(muter.getLogs()).to.equal(`Intercepted message /message 3/
Intercepted message /message 2/
Intercepted message /message 1/
`);
      });
    });
  }));

  it(`Testing listenTime`, captured(muter, function () {
    // Fails when listen time is too short and listened process logs too late

    return Promise.all([
      'message 1',
      'message 2',
      'message 3',
    ].map((msg, i) => {
      return Promise.all([
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolveMessage(msg)().then(err => {
              expect(err).to.be.undefined;
            }).then(resolve, reject);
          }, i * 2000);
        }),
        new Promise((resolve, reject) => {
          setTimeout(() => {
            echo(msg, {listenTime: 500}).then(resolve, reject);
          }, 1000);
        }),
      ]).catch(err => {
        expect(err.message).to.match(/Failed to intercept \/message 1\//);
      }).then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              expect(muter.getLogs({logger: console, method: 'log'}))
                .to.equal(`Intercepted message /message 2/
Intercepted message /message 3/
`);
              expect(muter.getLogs({logger: console, method: 'error'}))
                .to.equal(`Failed to intercept /message 1/
`);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, 4000);
        });
      });
    }));
  }));

  it(`Testing startDelay`, captured(muter, function () {
    // When listened process takes too long to return, force resolve so that
    // it may be listened to on the fly instead of buffer
    return Promise.all([
      'message 1',
      'message 2',
      'message 3',
    ].map((msg, i) => {
      return Promise.all([
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolveMessage(msg)().then(err => {
              expect(err).to.be.undefined;
            }).then(resolve, reject);
          }, i * 2000);
        }),
        echo(msg, {startDelay: 1000, listenTime: 500}),
      ]).catch(err => {
        expect(err.message).to.match(/Failed to intercept \/message 1\//);
      }).then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              expect(muter.getLogs({logger: console, method: 'log'}))
                .to.equal(`Intercepted message /message 2/
Intercepted message /message 3/
`);
              expect(muter.getLogs({logger: console, method: 'error'}))
                .to.equal(`Failed to intercept /message 1/
`);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, 4000);
        });
      });
    }));
  }));
});
