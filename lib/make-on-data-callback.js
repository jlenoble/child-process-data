'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = makeOnDataCallback;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeOnDataCallback(_ref) {
  var format = _ref.format,
      messages = _ref.messages,
      allMessages = _ref.allMessages,
      dataCallbacks = _ref.dataCallbacks,
      std = _ref.std,
      silent = _ref.silent;

  return function (data) {
    var str = data.toString(format);
    messages.push(str);
    allMessages.push(str);

    function colorChunk(chunk) {
      if (chunk === '\n') {
        return;
      }

      if (chunk[0] === '\n') {
        return colorChunk(chunk.substring(1));
      }

      var found = false;
      var result = void 0;

      dataCallbacks.some(function (obj) {
        var match = chunk.match(obj.regexp);
        if (match) {
          found = true;
          result = (0, _assign2.default)(obj.callback.apply(obj, (0, _toConsumableArray3.default)(match)), { match: match });
        }
        return found;
      });

      if (!found) {
        if (!silent) {
          process[std].write(_chalk2.default.yellow(chunk));
        }
        return;
      }

      var _result$logger = (0, _slicedToArray3.default)(result.logger, 2),
          logger = _result$logger[0],
          method = _result$logger[1];

      if (result.match.index > 0) {
        colorChunk(chunk.substring(0, result.match.index));
      }

      if (!silent) {
        logger[method](result.coloredChunk);
      }

      var length = result.match[0].length + result.match.index;
      if (chunk.length > length) {
        colorChunk(chunk.substring(length));
      }
    }

    colorChunk(str);
  };
}
module.exports = exports['default'];