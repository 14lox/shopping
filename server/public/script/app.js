'use strict';

/* App Module */

var shoppingApp = angular.module('shoppingApp', [
  'ngRoute',
  'shoppingAppControllers',
  'underscore',
  '$strap.directives',
  'shoppingDirectives'
]);

shoppingApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/mylist', {
        templateUrl: 'partials/mylist.html',
        controller: 'MyListCtrl'
      }).
      when('/items/:itemId', {
        templateUrl: 'partials/itemPromotion.html',
        controller: 'PromotionDetailCtrl'
      }).
      otherwise({
        redirectTo: '/mylist'
      });
  }]);
