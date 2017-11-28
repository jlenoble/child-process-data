"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

exports.default = makeDataCallbacks;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeDataCallbacks(callbacks) {
  var dataCallbacks = [];
  (0, _keys2.default)(callbacks).forEach(function (key) {
    dataCallbacks.push({
      pattern: key,
      regexp: new RegExp(key),
      callback: callbacks[key]
    });
  });
  return dataCallbacks;
}
module.exports = exports["default"];