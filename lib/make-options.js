'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = makeOptions;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeOptions(opts) {
  var options = (0, _assign2.default)({
    format: 'utf-8',
    dataCallbacks: {
      '(Starting) \'(\\w+([:-_]\\w+)*)\'\\.\\.\\.': function StartingW_W(match, action, task) {
        console.log(action + ' \'' + _chalk2.default.cyan(task) + '\'...');
        options.dataUp();
      },
      '(Finished) \'(\\w+([:-_]\\w+)*)\' after (\\d+\\.?\\d* m?s)': function FinishedW_WAfterDDMS(match, action, task) {
        var _ref;

        console.log(action + ' \'' + _chalk2.default.cyan(task) + '\' after ' + _chalk2.default.magenta((_ref = (arguments.length <= 3 ? 0 : arguments.length - 3) - 1 + 3, arguments.length <= _ref ? undefined : arguments[_ref])));
        options.dataDown();
      },
      '\\[(\\d\\d:\\d\\d:\\d\\d)\\]': function dDDDDD(match) {
        process.stdout.write(_chalk2.default.gray(match) + ' ');
      },
      '(Working directory changed to|Using gulpfile) (.+)': function WorkingDirectoryChangedToUsingGulpfile(match, action, path) {
        console.log(action + ' ' + _chalk2.default.magenta(path));
      }
    },
    dataLevel: 0,
    dataUp: function dataUp() {
      options.dataLevel++;
    },
    dataDown: function dataDown() {
      options.dataLevel--;
      if (!options.dataLevel) {
        options.resolve();
      }
    }
  }, opts);

  return options;
}
module.exports = exports['default'];