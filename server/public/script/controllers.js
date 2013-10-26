'use strict';

/* Controllers */

var shoppingAppControllers = angular.module('shoppingAppControllers', []);

shoppingAppControllers.controller('MyListCtrl', ['$scope', '$http', '_',
  function MyListCtrl($scope, $http) {

    $scope.list = [];

    $scope.addItem = function(){
      if($scope.newItem == '' || $scope.newItem == undefined)
        return;

      if(_.some($scope.list, function(item){
        return item.name == $scope.newItem;
      })){
         alert("item already exists in the list");
          return;
      }

      $scope.list.push({name:$scope.newItem, save:false});

      //set local storage
      localStorage.setItem($scope.newItem, undefined);

      $http.post('/promotion/post_query', {query: $scope.newItem}).success(successCallback);

    };

	var	successCallback = function(data){
    	if(data.promotions.length == 0) return;

      var target = _.find($scope.list, function(item){
        return item.name == $scope.newItem;
      });
      target.save = true;
      localStorage.setItem($scope.newItem, JSON.stringify(data));

          //data.promotions.forEach(function(promotion){
          //	$scope.list.push(promotion.name);
              //$("#"+dataId).append( "<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>" + promotion.supplier + ":&nbsp;&nbsp;</i>" + promotion.content + "</p>" );
          //});
          //append show promotion to the item
          //$("#"+itemId).append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a class='showPromotion' href='#'><img style='width: 2%; height: 2%' src='/image/sale.png'></a>"); 

    };

    

    
  }]);

shoppingAppControllers.controller('PromotionDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    //$scope.phoneId = $routeParams.phoneId;
  }]);
