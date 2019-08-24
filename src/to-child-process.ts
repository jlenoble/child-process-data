import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { ChildProcessWithReadableStdStreams } from "./child-process";

export type SpawnArguments =
  | [string]
  | [string, SpawnOptionsWithoutStdio | undefined]
  | [string, string[] | undefined, SpawnOptionsWithoutStdio | undefined];

export default function toChildProcess(
  args: SpawnArguments
): ChildProcessWithReadableStdStreams {
  if (args.length === 3) {
    const [command, _args, options] = args;
    return spawn(command, _args, options);
  } else if (args.length === 2) {
    const [command, _args] = args;
    return spawn(command, _args);
  } else {
    const [command] = args;
    return spawn(command);
  }
}
