import path from "path";
import { fork, ChildProcess } from "child_process";
import { ChildProcessWithReadableStdStreams } from "./child-process";

// Hack to access portably the class of a child process, only exposed as a type, not an object.
// Importing may be overkill, but we want to be certain this hack will survive tree shaking.
import dummy from "./dummy";
const ChildProcessClass = fork(path.join(__dirname, dummy)).constructor;

export default function checkChildProcess(
  childProcess: ChildProcess
): ChildProcessWithReadableStdStreams {
  // At the minimum for childProcessData to work, childProcess must be an actual
  // ChildProcess and stdout and stderr must exist on it
  if (!(childProcess instanceof ChildProcessClass)) {
    throw new TypeError("Not a ChildProcess instance " + childProcess);
  }

  if (!childProcess.stdout) {
    throw new ReferenceError("Undefined child process stdout");
  }

  if (!childProcess.stderr) {
    throw new ReferenceError("Undefined child process stderr");
  }

  return childProcess as ChildProcessWithReadableStdStreams;
}
