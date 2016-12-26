import {spawn} from 'child_process';

export const ChildProcess = spawn('true').constructor;

export default function checkChildProcess (childProcess) {
  if (!(childProcess instanceof ChildProcess)) {
    throw new TypeError('Not a ChildProcess instance ' + childProcess);
  }

  if (!childProcess.stdout) {
    throw new ReferenceError('Undefined child process stdout');
  }

  if (!childProcess.stderr) {
    throw new ReferenceError('Undefined child process stderr');
  }

  return childProcess;
}
