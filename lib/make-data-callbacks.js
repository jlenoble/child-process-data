"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

exports.default = makeDataCallbacks;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeDataCallbacks(callbacks) {
  return (0, _keys2.default)(callbacks).map(function (key) {
    return {
      pattern: key,
      regexp: new RegExp(key),
      callback: callbacks[key]
    };
  });
}
module.exports = exports["default"];