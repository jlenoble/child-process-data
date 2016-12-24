"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeDataCallbacks;
function makeDataCallbacks(callbacks) {
  var dataCallbacks = [];
  Object.keys(callbacks).forEach(function (key) {
    dataCallbacks.push({
      pattern: key,
      regexp: new RegExp(key),
      callback: callbacks[key]
    });
  });
  return dataCallbacks;
}
module.exports = exports["default"];