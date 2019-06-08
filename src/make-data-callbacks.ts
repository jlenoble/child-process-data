import { DataCallbacks } from "./data-callbacks/handler";
import { CallbackOptions } from "./options";

export default function makeDataCallbacks(
  callbacks: DataCallbacks
): CallbackOptions[] {
  return Object.keys(callbacks).map(
    (key): CallbackOptions => ({
      pattern: key,
      regexp: new RegExp(key),
      callback: callbacks[key]
    })
  );
}
