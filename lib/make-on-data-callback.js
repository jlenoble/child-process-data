'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = makeOnDataCallback;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeOnDataCallback(format, messages, allMessages, dataCallbacks, std) {
  return function (data) {
    var str = data.toString(format);
    messages.push(str);
    allMessages.push(str);

    var found = false;

    dataCallbacks.some(function (obj) {
      var res = str.match(obj.regexp);
      if (res) {
        found = true;
        obj.callback.apply(obj, (0, _toConsumableArray3.default)(res));
      }
      return found;
    });

    if (!found) {
      process[std].write(_chalk2.default.yellow(str));
    }
  };
}
module.exports = exports['default'];