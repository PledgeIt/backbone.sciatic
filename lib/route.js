'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _backbone = require('backbone');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A Route is an object that is associated with each URL. When a URL is
// navigated to, the router transitions into the Route object, calling a
// series of callbacks.
var Route = function _Route(_ref) {
    var router = _ref.router;

    this._router = router;
};

(0, _assign2.default)(Route.prototype, {
    // An optional array of sync/async methods that will run in sequence before
    // fetch() or after show() is called. Filter is defined as an object,
    // containing either/both a before() and after()
    //
    // filters: [
    //     {
    //         before() { ...do something before fetch },
    //         after() { ...do something after show },
    //     }
    // ]
    filters: [],

    // Method for gathering data necessary to run the route's handler
    fetch: function fetch() {},


    // Main route handler, called after fetch() has resolved
    show: function show() {},


    // Hook for when route is detatched for a new route, can be used for any
    // necessary cleanup
    exit: function exit() {},


    // Proxy to the router's navigate() method
    navigate: function navigate() {
        var _router;

        (_router = this._router).navigate.apply(_router, arguments);
        return this;
    }
}, _backbone.Events);

Route.extend = _backbone.Model.extend;

exports.default = Route;