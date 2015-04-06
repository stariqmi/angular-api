## What is angular-api?
It is a module that helps in creating a service to deal with all your api calls within the angular application.
It uses the module **routes** to attach handlers to your api routes.

The module exposes the Initiator class that can be used to add your base api url along with routes and route handlers. If a route handler is not specified, a standard route handler is used.

## API
The module returns the Initiator class with the following methods defined on it.

### addRoute
Add a route with a handler on an Initiator instance. If the handler is not defined, the _standardRouteHandler 
is used. Look at the example below for handler function's signature.

### serve
Returns a constructor function to be used by **module.service** as a constructor for the service. The serve function
is basically a **closure**.

## How to use it?
angular-api is simple to use.

### api.js
Create a module that returns a constructor function for services to be created with.

```javascript
// filename: api.js
// Require modules
var ApiInititor = require('angular-api');

// Create an instance of the Initiator, passing in your api's base url
var API = new ApiInitiator('http://www.myapi.com');

// Add some routes
API.addRoute(':reqType//books');      // Use built-in standard handler
API.addRoute(':reqType//books/:id');  // Use built-in standard handler
// :reqType is important, that way, you can specify what type of request it is
// and the built-in standard handler takes care of making of a request of that type.

// Define a route with custom handler
API.addRoute('/books/:id/update', 
  
  // Custom handler for route
  // @params  {string}    url     e.g /books/8/update
  // @params  {object}    match   consult [routes](https://www.npmjs.com/package/routes) docs for match format
  // @params  {object}    data    data/payload/params for PUT and POST requests
  function(url, match, data) {
    // The 'this' object has http($http) and q($q) defined on it

    // since it is a custom handler, you will have to make the http request yourself
    // the built-in handler takes care of the folowing step and more
    return this.http.put(self.api + url, data) // Return a promise
  }
);

// Create Api Service constructor using the 'serve' function
// The 'serve' function returns a constructor function to be used by angular for instantiation
// of a service
module.exports = API.server
```


### app.js
```javascript
// filename: app.js
// Create Angular App

var angular = require('angular');
var api = require('./api.js');

var app = angular.module('MyApp', []);

app.service('ApiService', ['$http', '$q', api]);
// Don't forget to pass in $http, $q in that order

// Use the Api Service to make a request to one of the defined routes
app.controller('AppCtrl', ['ApiService', function(ApiService) {
  // Make Api request using the service
  ApiService.request('GET//books') // Returns a promise
  .then(function(data) {
    console.log(data);  // Data returned by request to api
  });

  // Make POST Api request with some params
  ApiService.request('POST//books', {name: 'ngBook', author: 'Google'}) // Returns a promise
  .then(function(data) {
    console.log(data);  // Data returned by request to api
  });

}]);
```

The current practice is to return a promise that gets resolved when an http response is received. To keep things consistent, return a promise in all your custom handlers using **this.q** or just **this.http** which itself returns a promise.

The initiator code, i.e adding routes can go in a separate angular module and added as a dependency to your angular application.


## What is left?
* Adding authentication for auth based routes.
