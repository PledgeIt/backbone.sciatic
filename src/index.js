'use strict';

import bb from 'backbone';
import Router from './router';
import Route from './route';

const api = { Router, Route };

// Attach the Route constructor
Router.Route = Route;

// Attach to Backbone
bb.Sciatic = api;

// Expose constructors
export default api;
