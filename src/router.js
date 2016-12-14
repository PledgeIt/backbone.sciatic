import _ from 'underscore';
import bb from 'backbone';
import BaseRouter from 'backbone.base-router';

const Router = BaseRouter.extend({
    // Default to no filters
    filters: [],

    // Providee the ability for a Route to cancel a navigation if it is not fit
    // to be exited. This is useful to ensure that a user does not, for
    // instance, leave a model unsaved.
    navigate(...args) {
        if (_.result(this.currentRoute, 'preventNavigation') !== true) {
            bb.history.navigate(...args);
        }

        return this;
    },

    // The BaseRouter provides us a single point of entry anytime a route is
    // matched by Backbone.history
    onNavigate({ linked: RouteCtr, params, query, uriFragment }) {
        // Create a new route each time we navigate
        const newRoute = new RouteCtr({ router: this });

        // Remove unnecessary pieces from the routeData
        const routeData = { params, query, uriFragment };

        // Store the route we're trying to transition to. This lets us know if
        // the user transitions away at a later time.
        this._transitioningTo = newRoute;

        // Convenience method for pulling relevant filters
        function getFilters(obj, type) {
            return obj.filters.reduce((arr, filter) => {
                const fn = filter[type];
                return fn ? [...arr, fn.bind(obj)] : arr;
            }, []);
        }

        // Gather filter chains
        const promiseChain = [
            // Router "before" filters
            ...getFilters(this, 'before'),

            // Route "before" filters
            ...getFilters(newRoute, 'before'),

            // Route fetch method
            newRoute.fetch.bind(newRoute),

            // Exit previous route
            () => (this.currentRoute ? this.currentRoute.exit() : undefined),

            // Store reference to this new route
            () => { this.currentRoute = newRoute; },

            // Route show method
            newRoute.show.bind(newRoute),

            // Route "after" filters
            ...getFilters(newRoute, 'after'),

            // Router "after" filters
            ...getFilters(this, 'after'),

            // Finally trigger a navigate event on the router & remove reference
            // to the route-in-progress
            () => {
                this.trigger('navigate', routeData);
                delete this._transitioningTo;
                return this;
            },
        ];

        // Start the crazy promise chain
        return promiseChain.reduce((p, fn) => p.then(() => {
            // Anytime the developer has an opportunity to navigate again,
            // we need to check if they have. If they have, then we stop.
            // We need to do this check after every step.
            if (this._transitioningTo !== newRoute) { return this; }
            return fn(routeData); // eslint-disable-line consistent-return
        }), Promise.resolve())

            // If there are errors at any time, then we look for an `error`
            // method of the Route. If it exists, we execute it; otherwise, we
            // use the Router's `error` callback.
            .catch((e) => {
                const handler = newRoute.error || this.error;
                return handler(e, routeData);
            });
    },

    // The error callback is executed whenever there is an unhandled exception
    // in your Route. You can specify an `error` callback in a route for
    // per-route handling, or override this method to modify the default
    // handling of errors.
    error(e) {
        console.error(e);
        return this;
    },
});

// Export
export default Router;
