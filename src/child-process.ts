import { Writable, Readable } from "stream";
import { ChildProcess } from "child_process";

// childProcessData expects of course to have something to read from
export interface ChildProcessWithReadableStdStreams extends ChildProcess {
  stdin: Writable | null;
  stdout: Readable;
  stderr: Readable;
  readonly stdio: [
    Writable | null,
    Readable,
    Readable,
    Writable | Readable | null | undefined,
    Writable | Readable | null | undefined
  ];
}
