/*

authFactory.js
handles http request for auth controller

*/

angular.module('App.authFactory', [] )

.factory('AuthFactory', ['$http', '$state', '$window', function($http, $state, $window) {

  var signIn = function(){

  };

  return {
    signIn : signIn
  };

}])