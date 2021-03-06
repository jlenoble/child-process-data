import chalk from "chalk";
import LevelingHandler from "./leveling-handler";
import {
  ColoringCallback,
  ColoringOptions,
  ProtoDataCallbacks
} from "./handler";

const protoDataCallbacks: ProtoDataCallbacks = {
  "Starting '(\\w+(?:[-:]\\w+)*)'\\.\\.\\.": (
    handler: LevelingHandler
  ): ColoringCallback => ([, task]): ColoringOptions => {
    handler.dataUp();
    return {
      coloredChunk: `Starting '${chalk.cyan(task)}'...`,
      logger: [console, "log"]
    };
  },

  "Finished '(\\w+(?:[-:]\\w+)*)' after (\\d+\\.?\\d* m?s)": (
    handler: LevelingHandler
  ): ColoringCallback => ([, task, duration]): ColoringOptions => {
    handler.dataDown();
    return {
      coloredChunk: `Finished '${chalk.cyan(task)}' after ${chalk.magenta(
        duration
      )}`,
      logger: [console, "log"]
    };
  },

  "\\[(\\d\\d:\\d\\d:\\d\\d)\\]": (): ColoringCallback => ([
    match
  ]): ColoringOptions => {
    return {
      coloredChunk: `${chalk.gray(match)}`,
      logger: [process.stdout, "write"]
    };
  },

  "(Working directory changed to|Using gulpfile) (.+)": (): ColoringCallback => ([
    ,
    action,
    path
  ]): ColoringOptions => {
    return {
      coloredChunk: `${action} ${chalk.magenta(path)}`,
      logger: [console, "log"]
    };
  }
};

export default class GulpHandler extends LevelingHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(start: Promise<any>, end: Promise<any>) {
    super(protoDataCallbacks, start, end);
  }
}
