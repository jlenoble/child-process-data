export interface Options {
  silent?: boolean;
  startDelay?: number;
  listenTime?: number;
  endDelay?: number;
  dontBlock?: boolean;
}

export interface NormalizedOptions extends Options {
  silent: boolean;
  startDelay: number;
  listenTime: number;
  endDelay: number;
  dontBlock: boolean;
}

export interface ColoringOptions {
  coloredChunk: string;
  logger: [object, string];
}

export interface TimerOptions {
  timeout?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onResolve?: (arg?: any) => void;
  onReject?: (err?: Error) => void;
  throwOnTimeout?: boolean;
}
