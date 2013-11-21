'use strict';

/* App Module */

var shoppingApp = angular.module('shoppingApp', [
  'ngRoute',
  'shoppingAppControllers',
  'underscore',
  '$strap.directives',
  'shoppingDirectives',
  'shoppingServices'
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
      when('/config', {
        templateUrl: 'partials/config.html',
        controller: 'ConfigCtrl'
      }).
      when('/topsavings',{
        templateUrl: 'partials/topsavings.html',
        controller: 'TopSavingsCtrl'
      }).
      otherwise({
        redirectTo: '/mylist'
      });
  }]);
