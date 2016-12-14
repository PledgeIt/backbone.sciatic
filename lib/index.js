'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _route = require('./route');

var _route2 = _interopRequireDefault(_route);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Attach the Route constructor
_router2.default.Route = _route2.default;

// Attach to Backbone
_backbone2.default.Sciatic = _router2.default;

// Expose router constructor
exports.default = _router2.default;