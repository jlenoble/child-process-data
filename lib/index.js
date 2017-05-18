'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeIOTest = exports.makeSingleTest = undefined;

var _makeSingleTest = require('./make-single-test');

Object.defineProperty(exports, 'makeSingleTest', {
  enumerable: true,
  get: function get() {
    return _makeSingleTest.makeSingleTest;
  }
});

var _makeIoTest = require('./make-io-test');

Object.defineProperty(exports, 'makeIOTest', {
  enumerable: true,
  get: function get() {
    return _makeIoTest.makeIOTest;
  }
});

var _childProcessData = require('./child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _childProcessData2.default;