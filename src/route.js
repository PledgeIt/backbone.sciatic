import { Events, Model } from 'backbone';

const { extend } = Model;

// A Route is an object that is associated with each URL. When a URL is
// navigated to, the router transitions into the Route object, calling a
// series of callbacks.
const Route = function _Route({ router }) {
    this._router = router;
};

Object.assign(Route.prototype, {
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
    fetch() {},

    // Main route handler, called after fetch() has resolved
    show() {},

    // Hook for when route is detatched for a new route, can be used for any
    // necessary cleanup
    exit() {},

    // Proxy to the router's navigate() method
    navigate(...args) {
        this._router.navigate(...args);
        return this;
    },
}, Events, { extend });

export default Route;
