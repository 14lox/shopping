'use strict';

/* Directives */

var directives = angular.module('shoppingDirectives', []);

directives.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

directives.directive('ngImageOnLoad', function() {
    return function(scope, element, attrs) {
            element.bind('load', function() {
                scope.$apply(function (){
                    scope.$eval(attrs.ngImageOnLoad);
                });
            });
    };
});
