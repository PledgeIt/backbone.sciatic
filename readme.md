# Backbone.Sciatic

[![Build Status](https://travis-ci.org/PledgeIt/backbone.sciatic.svg?branch=master)](https://travis-ci.org/PledgeIt/backbone.sciatic)
[![Coverage Status](https://coveralls.io/repos/github/PledgeIt/backbone.sciatic/badge.svg?branch=master)](https://coveralls.io/github/PledgeIt/backbone.sciatic?branch=master)
[![Dependencies](https://david-dm.org/PledgeIt/backbone.sciatic.svg)](https://david-dm.org/PledgeIt/backbone.sciatic)
[![Dev-Dependencies](https://david-dm.org/PledgeIt/backbone.sciatic/dev-status.svg)](https://david-dm.org/PledgeIt/backbone.sciatic?type=dev)

Backbone.Sciatic is a Promise-based routing solution for Backbone. This project was largely borrowed/influenced by the fantastic work on [Premium-Router](https://github.com/jmeas/backbone.premium-router) and [Blazer](https://github.com/Betterment/backbone.blazer). Sciatic is built upon [Base-Router](https://github.com/jmeas/backbone.base-router), which extends the native Backbone Router.

Sciatic provides an abstracted Route class with method hooks for fetching data & displaying views. It also provides before/after hooks for middleware injection (great for authentication checks, flash dialogs, etc). Also features (thanks to Premium-Router) the ability to re-route during transitions, or cancel navigation.

## Installation

Install this package via [npm](https://npmjs.org).

```sh
$ npm install backbone.sciatic
```

## Dependencies

- [Backbone](https://npmjs.com/package/backbone)
- [Underscore](https://npmjs.com/package/underscore) / [Lodash](https://npmjs.com/package/lodash)
- [jQuery](https://npmjs.com/package/jquery)
- [Backbone.Base-Router](https://npmjs.com/package/backbone.base-router)

While not a dependency, it's highly recommended that you use a plugin such as [Backbone.Intercept](https://npmjs.com/package/backbone.intercept) to ensure that all of your relative links are captured by the router and properly navigated (using `{ trigger: true }`). Routes in Sciatic will not be invoked unless `{ trigger: true }` is passed.

### Worth Noting

You should avoid using `Backbone.history.navigate()` method directly on `Backbone.history` and instead use the `navigate()` method on your Sciatic router. Sciatic provides a way for the current route to prevent transitions (for cases such as form progress needing to be saved, etc), and accessing `Backbone.history` directly will bypass this behavior.

## Getting Started

Registering routes in Backbone.Sciatic is very similar to setting up routes in any other Backbone Router, only instead of passing controller methods, you pass it a Route class definition:

```js
import Sciatic from 'backbone.sciatic';
import HomeRoute from './modules/home/route';
import PostRoute from './modules/post/route';

const router = new Sciatic.Router({
	routes: {
		'home': HomeRoute,
		'posts/:postId': PostRoute,
	},
});

export default router;
```

The Route Class in it's simplest form is used to fetch data & show the corresponding view. The methods defined in the route happen in series (fetch, then show):

```js
import Sciatic from 'backbone.sciatic';

const PostRoute = Sciatic.Route.extend({

	// Fetch is called once all the "before" filters have
	// resolved. This method is meant to fetch any data
	// that hasn't already been fetched in a filter
	fetch(routeData) {
		
		// We attach the data directly to routeData
		// as it will be passed into show() later
		routeData.post = new Post({ 
			id: routeData.params.postId, 
		});
		
		// Return a promise, which will be resolved 
		// before show() is called
		return routeData.post.fetch();
	},
	
	// Show is called immediately after fetch() has
	// resolved. It is not called if fetch() throws
	// an error or returns a rejecting Promise
	show(routeData) {
	
		// Load up a view instance with the fetched data
		const view = new PostView({ 
			model: routeData.post,
		});

		// Render the view somewhere...
	}
});

export default PostRoute;
```

## Filters

Both the `Router` and `Route` classes accept middleware filters. These filters are formatted as an object containing a `before` and/or an `after` function. Every before/after method will receive the same `routeData` object and run in series, each waiting for the previous to resolve before it itself runs. Filters are are run in the following order on a navigate event:

- Router `before()` filters
- Matched route `before()` filters
- Matched route `fetch()` method
- Matched route `show()` method
- Matched route `after()` filters
- Router `after()` filters

Example filter object:

```js
{
	// Will run before fetch()
	before(routeData) {
	
		// Returning a promise from a filter method
		// will halt execution of the next filter
		// until Promise has been resolved.
		return authenticationCheck()
			.then(user => routeData._user = user);
	},
	
	// Will run after show()
	after(routeData) {
		
		// routeData object is passed from filter
		// to filter, so data attached previously
		// will be available down the chain.
		let message;
		
		if (route._user) {
			message = 'User logged in!';
		} else {
			message = 'User not logged in';
		}
		
		showFlashMessage(message);
	}
}
```

# API

## Router

### `#filters`

An array, or method that returns an array, of [filter objects](#Filters).

```js
const MyRouter = Sciatic.Router.extend({
	filters: [
		{
			before(routeData) {
				routeData._user = getAuthenticatedUser();
			},

			after(routeData) {
				logToAnalytics(routeData.uriFragment);
			},
		},
	],
});
```

### `#navigate(uriFragment, [options={}])`

Main method for navigating to a new route. If current route doesn't prevent transition, arguments are passed on to `Backbone.history.navigate()`.

```js
const router = new Sciatic.Router();

router.navigate('/posts/id_123', { trigger: true });
```

### `#error(err)`

Fallback error handler. Errors are handled at the route-level, but if no error handler is provided, it will bubble to this method. Defaults to log with `console.error()`.

```js
const MyRouter = Sciatic.Router.extend({
	error(err) {
		showFlashMessage('An error has occurred.');
		console.error('Route error:', err);
	},
});
```

## Route

### `#filters`

An array, or method that returns an array, of [filter objects](#Filters).

```js
const PostRoute = Sciatic.Route.extend({
	filters: [
		{
			before(routeData) {
				if (!routeData._user) { 
					return this.navigate('/login', { trigger: true }); 
				}
			},

			after(routeData) {
				showFlashMessage('Success!');
			},
		},
	],
});
```

### `#fetch(routeData)`

Method intended for fetching data from outside sources. Is called after Router and Route "before" filters, and before `show()`.

```js
const PostRoute = Sciatic.Route.extend({
	fetch(routeData) {
		routeData.post = new Post({ 
			id: routeData.params.postId,
		});
		
		return routeData.post.fetch();
	},
});
```

### `#show(routeData)`

Method intended for creating & showing views. Is called after `fetch()` has resolved.

```js
const PostRoute = Sciatic.Route.extend({
	show(routeData) {
		const view = new PostView({ 
			model: routeData.post,
		});

		// Render the view somewhere...
	},
});
```

### `#error(err)`

Error handler for the route, optional. If no `error()` method is supplied, the error will bubble up to the Router instance.

```js
const PostRoute = Sciatic.Route.extend({
	error(err) {
		if (err.statusCode === 400) {
			return this.navigate('/404', { trigger: true });
		}
		
		showFlashMessage('An error has occurred.');
		console.error('Route error:', err);
	},
});
```

### `#navigate(uriFragment, [options={}])`

Shortcut to router's `navigate()` function, passes arguments directly to Router instance. Returns Route instance.

```js
const PostRoute = Sciatic.Route.extend({
	filters: [
		{
			before(routeData) {
				if (!routeData._user) {
					this.navigate('/login', { 
						trigger: true, 
						replace: true,
					});
				}
			},
		},
	],
```

## Contributing

Pull requests are always welcome! Please be sure to include any tests for new code & follow the current coding style as best you can.

You can run the test suite with the following command:

```
$ npm test
```


## License

Any contributions made to this project are covered under the MIT License, [found here](https://github.com/PledgeIt/backbone.sciatic/blob/master/license.md).