'use strict';


// Declare app level module which depends on filters, and services
var Permutator = angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap',
  'ImageCropper'
  ]);

Permutator.config(['$routeProvider', 'USER_STATUS', '$httpProvider', function($routeProvider, USER_STATUS, $httpProvider) {
  $routeProvider
  .when('/index', {
    templateUrl: 'partials/index.html',
    controller: 'IndexCtrl',
    authorizedRoles : [USER_STATUS.admin, USER_STATUS.granted],
    resolve: {
        Authorized: function(CheckAccess){
            return CheckAccess();
        }
  }
})
.when('/manuel', {
    templateUrl: 'partials/recherche-manuel.html',
    controller: 'ManualCtrl',
    authorizedRoles : [USER_STATUS.admin, USER_STATUS.granted],
    resolve: {
        Authorized: function(CheckAccess){
            return CheckAccess();
        }
    }
})
.when('/edition-profil', {
    templateUrl: 'partials/edition-utilisateur.html', 
    controller: 'EditionCtrl',
    authorizedRoles : [USER_STATUS.admin, USER_STATUS.granted],
    resolve: {
        Authorized: function(CheckAccess){
            return CheckAccess();
        }
  }
})
.when('/login', {
    templateUrl : 'partials/login.html',
    controller: 'RegisterCtrl',
    resolve: {
       Accessible: function(User, $q){
            var start = $q.when('start');
            return start.then(function(){
                if(User.isAuthenticated()){
                    return $q.reject('error:allready-connected');
            }
        });
      }
  }
})
.when('/forget-password', {
    templateUrl: 'partials/password-perdu.html',
    controller: 'RegisterCtrl'
})
.otherwise({redirectTo: '/login'});

$httpProvider.interceptors.push('HttpInterceptor');
}]);

