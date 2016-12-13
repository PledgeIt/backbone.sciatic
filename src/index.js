'use strict';

import bb from 'backbone';
import Router from './router';
import Route from './route';

// Attach the Route constructor
Router.Route = Route;

// Attach to Backbone
bb.Sciatic = Router;

// Expose router constructor
export default Router;
