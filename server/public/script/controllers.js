'use strict';

/* Controllers */

var shoppingAppControllers = angular.module('shoppingAppControllers', []);

shoppingAppControllers.controller('MyListCtrl', ['$scope', '$http', '_',
  function MyListCtrl($scope, $http) {

    $scope.list = [];
    $scope.query = '';
    var itemOrder = 0;

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

     //reset newItem so the html input is cleared
     $scope.query = $scope.newItem;
     $scope.newItem = '';

      //set local storage
      var dataStr = JSON.stringify({order: ++itemOrder, date:new Date()})
      localStorage.setItem($scope.query.itemlize(), dataStr);

      $http.post('/promotion/post_query', {query: $scope.query}).success(successCallback);
    };

    var currentItem;
    $scope.setCurrentItem = function(item){
      currentItem = item;
    }
    
    $scope.removeItem = function(){
      var obj = _.find($scope.list, function(element){
        return element.name == currentItem;
      });
      var idx = _.indexOf($scope.list, obj);
      //remove from list
      $scope.list.splice(idx, 1);

      //set local storage
      localStorage.removeItem(currentItem.itemlize());
      $scope.hide();
    };

    


    var	successCallback = function(data){
    	if(data.promotions.length == 0) return;

      //set the list item with saving: true
      var target = _.find($scope.list, function(item){
        return item.name == $scope.query;
      });
      target.save = true;

      var obj = JSON.parse(localStorage[$scope.query.itemlize()]);
      obj.saving = data.promotions;

      localStorage.setItem($scope.query.itemlize(), JSON.stringify(obj));
    };




    var init = function () {
      for(var obj in window.localStorage){
        if(obj.isItem())
        {
          var storageObj = JSON.parse(localStorage[obj]);
          var saving = storageObj.saving;
          var order = storageObj.order;
          if(saving == undefined){
            $scope.list.push({name:obj.deItemlize(), save: false, order: order});
          }else{
            $scope.list.push({name:obj.deItemlize(), save: true, order: order});
          }
          //get the max item order
          if(itemOrder < order) itemOrder = order;
        }
      }
      $scope.list = _.sortBy($scope.list, function(item){return item.order});
    };
      // and fire it after definition
      init(); 

    }]);

shoppingAppControllers.controller('PromotionDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.item = $routeParams.itemId.itemlize();
    $scope.list = [];
    
    var init = function(){
      var obj = JSON.parse(localStorage[$scope.item]);
      $scope.list = obj.saving;
    };

    init();
  }]);
