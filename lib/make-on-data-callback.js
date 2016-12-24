'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
        obj.callback(res[1], res[2], res[3], res[4]);
      }
      return found;
    });

    if (!found) {
      process[std].write(_chalk2.default.yellow(str));
    }
  };
}
module.exports = exports['default'];