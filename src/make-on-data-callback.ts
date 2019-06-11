import colorChunkFactory from "./patterns/color-chunk";

export default function makeOnDataCallback({
  format,
  messages,
  allMessages,
  dataCallbacks,
  std,
  silent
}: DataCallbackOptions): (data: string) => void {
  return function(data): void {
    const str = data.toString(format);
    messages.push(str);
    allMessages.push(str);

    const colorChunk = colorChunkFactory({
      silent,
      std,
      perCallbackOptions: dataCallbacks
    });

    colorChunk(str);
  };
}
