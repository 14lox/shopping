'use strict';

/* Controllers */

var shoppingAppControllers = angular.module('shoppingAppControllers', []);

shoppingAppControllers.controller('MyListCtrl', ['$scope', '$http', '$window', '_',
  function MyListCtrl($scope, $http, $window) {

    $scope.$window = $window;

    $scope.list = [];
    $scope.boughtList = [];
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
      var dataStr = JSON.stringify({order: ++itemOrder, bought:false, date:new Date()})
      localStorage.setItem($scope.query.itemlize(), dataStr);

      $http.post('/promotion/post_query', {query: $scope.query}).success(successCallback);
    };

    
    $scope.removeItem = function(item){
      var obj = _.find($scope.boughtList, function(element){
        return element.name == item;
      });
      var idx = _.indexOf($scope.boughtList, obj);
      //remove from list
      $scope.boughtList.splice(idx, 1);

      //set local storage
      localStorage.removeItem(item.itemlize());
    };

    $scope.toggleBoughtItem = function(item, bought){
      var fromList = bought? $scope.list : $scope.boughtList;
      var toList = bought?$scope.boughtList : $scope.list;

      var obj = _.find(fromList, function(element){
        return element.name == item;
      });
      var idx = _.indexOf(fromList, obj);
      fromList.splice(idx, 1);

      toList.push(obj);
      
      sortList();
      

      //update local storage
      var local = JSON.parse(localStorage[item.itemlize()]);
      local.bought = bought;

      localStorage.setItem(item.itemlize(), JSON.stringify(local));
      };

    $scope.navTo = function(itemName, hasSave){
       if(hasSave){
          $window.location.href = '#/items/' + itemName
       }
    }


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

    var setCurrentImg = function(img)
    {
      alert(img);
    }

    var init = function () {
      for(var obj in window.localStorage){
        if(obj.isItem())
        {
          var storageObj = JSON.parse(localStorage[obj]);
          var saving = storageObj.saving;
          var order = storageObj.order;
          var target = storageObj.bought ? $scope.boughtList : $scope.list;

          if(saving == undefined){ //don't show saving for bought item
            target.push({name:obj.deItemlize(), save: false, order: order});
          }else{
            target.push({name:obj.deItemlize(), save: true, order: order});
          }
          //get the max item order
          if(itemOrder < order) itemOrder = order;
        }
      }
      sortList();
    };

    var sortList = function(){
      $scope.boughtList = _.sortBy($scope.boughtList, function(item){return item.order });
      $scope.list = _.sortBy($scope.list, function(item){return item.order});
    }
      // and fire it after definition
      init(); 

    }]);

shoppingAppControllers.controller('PromotionDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.item = $routeParams.itemId.itemlize();
    $scope.list = [];
    $scope.current_img = '';

    $scope.setCurrentImg = function(img){
      $scope.current_img = img;
    };
    
    var init = function(){
      var obj = JSON.parse(localStorage[$scope.item]);
      $scope.list = obj.saving;
    };

    init();
  }]);
