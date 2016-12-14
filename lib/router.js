'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _backbone3 = require('backbone.base-router');

var _backbone4 = _interopRequireDefault(_backbone3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Router = _backbone4.default.extend({
    // Default to no filters
    filters: [],

    // Providee the ability for a Route to cancel a navigation if it is not fit
    // to be exited. This is useful to ensure that a user does not, for
    // instance, leave a model unsaved.
    navigate: function navigate() {
        if (_underscore2.default.result(this.currentRoute, 'preventNavigation') !== true) {
            var _bb$history;

            (_bb$history = _backbone2.default.history).navigate.apply(_bb$history, arguments);
        }

        return this;
    },


    // The BaseRouter provides us a single point of entry anytime a route is
    // matched by Backbone.history
    onNavigate: function onNavigate(_ref) {
        var _this = this;

        var RouteCtr = _ref.linked,
            params = _ref.params,
            query = _ref.query,
            uriFragment = _ref.uriFragment;

        // Create a new route each time we navigate
        var newRoute = new RouteCtr({ router: this });

        // Remove unnecessary pieces from the routeData
        var routeData = { params: params, query: query, uriFragment: uriFragment };

        // Store the route we're trying to transition to. This lets us know if
        // the user transitions away at a later time.
        this._transitioningTo = newRoute;

        // Convenience method for pulling relevant filters
        function getFilters(obj, type) {
            return obj.filters.reduce(function (arr, filter) {
                var fn = filter[type];
                return fn ? [].concat((0, _toConsumableArray3.default)(arr), [fn.bind(obj)]) : arr;
            }, []);
        }

        // Gather filter chains
        var promiseChain = [].concat((0, _toConsumableArray3.default)(getFilters(this, 'before')), (0, _toConsumableArray3.default)(getFilters(newRoute, 'before')), [

        // Route fetch method
        newRoute.fetch.bind(newRoute),

        // Exit previous route
        function () {
            return _this.currentRoute ? _this.currentRoute.exit() : undefined;
        },

        // Store reference to this new route
        function () {
            _this.currentRoute = newRoute;
        },

        // Route show method
        newRoute.show.bind(newRoute)], (0, _toConsumableArray3.default)(getFilters(newRoute, 'after')), (0, _toConsumableArray3.default)(getFilters(this, 'after')), [

        // Finally trigger a navigate event on the router & remove reference
        // to the route-in-progress
        function () {
            _this.trigger('navigate', routeData);
            delete _this._transitioningTo;
            return _this;
        }]);

        // Start the crazy promise chain
        return promiseChain.reduce(function (p, fn) {
            return p.then(function () {
                // Anytime the developer has an opportunity to navigate again,
                // we need to check if they have. If they have, then we stop.
                // We need to do this check after every step.
                if (_this._transitioningTo !== newRoute) {
                    return _this;
                }
                return fn(routeData); // eslint-disable-line consistent-return
            });
        }, _promise2.default.resolve())

        // If there are errors at any time, then we look for an `error`
        // method of the Route. If it exists, we execute it; otherwise, we
        // use the Router's `error` callback.
        .catch(function (e) {
            var handler = newRoute.error || _this.error;
            return handler(e, routeData);
        });
    },


    // The error callback is executed whenever there is an unhandled exception
    // in your Route. You can specify an `error` callback in a route for
    // per-route handling, or override this method to modify the default
    // handling of errors.
    error: function error(e) {
        console.error(e);
        return this;
    }
});

// Export
exports.default = Router;