export default function makeDataCallbacks (callbacks) {
  let dataCallbacks = [];
  Object.keys(callbacks).forEach(key => {
    dataCallbacks.push({
      pattern: key,
      regexp: new RegExp(key),
      callback: callbacks[key],
    });
  });
  return dataCallbacks;
}
