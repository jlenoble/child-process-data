export default function makeDataCallbacks (callbacks) {
  return Object.keys(callbacks).map(key => ({
    pattern: key,
    regexp: new RegExp(key),
    callback: callbacks[key],
  }));
}
