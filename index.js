/**
 * 	Filename: 	index.js
 * 	Author: 	Salman Tariq Mirza
 *
 * 	This module exposes the API class, via the Initiator.
 * 	The Initiator constructor is used to add the base api url, routes
 * 	and route handlers to the API constructor function. Due to the restriction
 * 	that angular.module.service has to take a constructor function, the Initiator
 * 	constructor plays a key role in defining the API contructor passed into the
 * 	service function.
 *
 * 	The API is intended to be a layer that is used for all calls
 * 	to your api and exposes the routes module as a router for your api
 * 	routes. Any controller, directive and other services can consume the
 * 	service created by this to expose your api to the rest of the application
 *
 * 	For each route you can add a custom handler or let the built in handler
 * 	take care of your request.
 *
 * 	TODO:
 * 	Add built in handler for authentication
 */

// npm modules
var Router = require('routes');

module.exports = Initiator;


/**
 * Initiator Constructor function
 * @param 	{string} 		api 		base url to your api
 */
function Initiator(api) {
	var self = this;
	self.api = api;

	// Empty routes holder
	self.routes = {};
}


/**
 * Function exposed to add routes and their handlers.
 * @param 	{string} 		route   	url
 * @param 	{function} 	handler 	url/route handler
 * @return 	{object} 							API object for chaining
 */
Initiator.prototype.addRoute = function(route, handler) {
	var self = this;

	self.routes[route] = handler;
	
	return self; // For chaining
};


/**
 * Closure to create API constructor function
 * @return 	{Function} 	API Constructor function
 */
Initiator.prototype.serve = function() {
	var self = this;

	var api = self.api;
	var routes = self.routes;


	/**
	 * Constructor function that instantiates the API.
	 *  
	 * @param  	{object}   $http 	angular $http service
	 * @param  	{object}   $q    	angular $q service
	 * @param 	{string} 		api 	base URL to your API
	 * @return 	{function}				function as required by an Angular Service
	 */
	function API($http, $q) {
		var self = this;

		self.api = api;
		self.http = $http;
		self.q = $q;

		// Router using the routes module
		var router = self.router = Router();
		
		// Add routes to router
		var route_keys = Object.keys(routes);
		for (var index in route_keys) {
			var route = route_keys[index];
		
			// Use standard handler if none provided
			var handler = routes[route] || _standardRequestHandler;
			router.addRoute(route, handler);
		}
	}


	/**
	 * Function exposed by the API to controller, services and directives.
	 * This is the function that is called for any request to the API
	 * @param  {string} 	url  	url to be requested
	 * @param  {object} 	data 	data to be sent to the API if any
	 * @return {promise}      		the call to the router match's fn returns a promise
	 */
	API.prototype.request = function(url, data) {
		var self = this;

		// Match route
		var match = this.router.match(url);
	  
		// We need to use apply, otherwise, 'this' in the fn refers to the 'match' itself
		return match.fn.apply(self, [url, match, data]); 	// Return promise
	};


	/**
	 * Private function that is the standard request handler for routes.
	 * @param  {string} url   the route that was requested
	 * @param  {object} match match object returned by the router
	 * @param  {object} data  data passed to the request
	 * @return {promise}      a promise to be resolved when the remote API responds
	 */
	function _standardRequestHandler(url, match, data) {
		var self = this;

		// Make sure data being sent is never undefined
		var payload = data || {};

		var defer = self.q.defer();
		var reqType = match.params.reqType;

		// Replace reqType from URL
		url = url.replace(reqType + '/', '');

		if (reqType === 'POST') {

			// Make actual request to the API
			self.http.post(self.api + url, payload)
			.then(function(response) {

				// Resolve with the data
				defer.resolve(response.data);
			});
		}

		else if (reqType === 'GET') {
			
			// Make actual request to the API
			self.http.get(self.api + url)
			.then(function(response) {

				// Resolve with the data
				defer.resolve(response.data);
			});
		}

		else if (reqType === 'DELETE') {
			// Make actual request to the API
			self.http.delete(self.api + url)
			.then(function(response) {

				// Resolve with the data
				defer.resolve(response.data);
			});	
		}

		else if (reqType === 'PUT') {

			// Make actual request to the API
			self.http.put(self.api + url, payload)
			.then(function(response) {

				// Resolve with the data
				defer.resolve(response.data);
			});
		}

		else {
			throw new Error('Invalid request type: ' + reqType);
		}

		return defer.promise;
	};

	return API;
}