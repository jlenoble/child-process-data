import { ChildProcessWithReadableStdStreams } from "../child-process";
import MessageTester from "./message-tester";
import deepKill from "deepkill";

export default class Result extends MessageTester {
  public readonly childProcess: ChildProcessWithReadableStdStreams;
  public readonly pid: number;

  public constructor(childProcess: ChildProcessWithReadableStdStreams) {
    super();
    this.childProcess = childProcess;
    this.pid = childProcess.pid;
  }

  public async deepKill(): Promise<void> {
    return deepKill(this.pid);
  }
}
