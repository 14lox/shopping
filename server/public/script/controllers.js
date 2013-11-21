'use strict';

/* Controllers */

var shoppingAppControllers = angular.module('shoppingAppControllers', []);

shoppingAppControllers.controller('MyListCtrl', ['$scope', '$http', '$window', 'activeSupplierService', '_',
  function MyListCtrl($scope, $http, $window,activeSupplierService) {

    $scope.$window = $window;

    $scope.list = [];
    $scope.boughtList = [];
    $scope.query = '';
    $scope.showSpinner = false;

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
     if($scope.list.length == 0){
      setLastUpdateTime();
     }
     $scope.list.push({name:$scope.newItem, save:false});

     //reset newItem so the html input is cleared
     $scope.query = $scope.newItem;
     $scope.newItem = '';

      //set local storage
      var dataStr = JSON.stringify({order: ++itemOrder, bought:false, date:new Date()})
      localStorage.setItem($scope.query.itemlize(), dataStr);

      $http.post('/promotion/post_query', {query: $scope.query}).success(query_succeeded);
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

    $scope.refresh = function(){
      $scope.showSpinner = true;
      $http.post('/promotion/post_bulkquery', {queries: _.pluck($scope.list, 'name')}).
        success(bulk_query_succeeded).
        error(function(){
          alert('Sorry, cannot refresh at the moment. Please try later');
          $scope.showSpinner = false;
        });
    }

    //data format:  [{item: rice, promotions:[{},{}]}, {item: samlon, promotions:[]}]
    var bulk_query_succeeded = function(dataList){
        _.each($scope.list, function(item){
            var newItem = _.find(dataList, function(d){return d.item == item.name});
            if(newItem == undefined) return; //should not happen

            var obj = JSON.parse(localStorage[item.name.itemlize()]);
            obj.saving = newItem.promotions;
            localStorage.setItem(item.name.itemlize(), JSON.stringify(obj));

            item.save = showSave(obj.saving);

        });

        setLastUpdateTime();
        $scope.isExpired = false;
        $scope.showSpinner = false;

    }

    var setLastUpdateTime = function(){
      localStorage["lastRefreshTime"] = Math.ceil(Date.now()/1000);
    }

    var showSave = function(savings){
       return _.filter(savings, function(obj){
        return activeSupplierService.isSupplierActive(obj['supplier']);
      }).length > 0;
    }


    var	query_succeeded = function(data){
    	if(data.promotions.length == 0) return;

      //set the list item with saving: true
      var target = _.find($scope.list, function(item){
        return item.name == $scope.query;
      });
      

      var obj = JSON.parse(localStorage[$scope.query.itemlize()]);
      obj.saving = data.promotions;
      target.save = showSave(obj.saving);

      localStorage.setItem($scope.query.itemlize(), JSON.stringify(obj));
    };

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
            target.push({name:obj.deItemlize(), save: showSave(saving), order: order});
          }
          //get the max item order
          if(itemOrder < order) itemOrder = order;
        }
      }
      sortList();

      processExpire();

      getTopSavings();
    };

    var sortList = function(){
      $scope.boughtList = _.sortBy($scope.boughtList, function(item){return item.order });
      $scope.list = _.sortBy($scope.list, function(item){return item.order});
    }

    var processExpire = function(){
      $scope.isExpired = false;

      //don't set expire if there is no item
      if($scope.list.length == 0){
        return;
      }

      var lastRefreshTime = localStorage["lastRefreshTime"];
      if(lastRefreshTime == undefined){
        //UTC Date value in seconds
        setLastUpdateTime();
      }
      $http.get('/promotion/isExpired?lastRefreshTime=' + lastRefreshTime)
      .success(function(data, status, headers, config) {
          $scope.isExpired = data ==='true';
        })
    }

    var getTopSavings = function(){
      if(localStorage["topSavings"] != undefined){
        return;
      }
      $http.get('/promotion/topSavings').
      success(function(data, status, headers, config){
        localStorage["topSavings"] = JSON.stringify(data);
      });
    }
    // and fire it after definition
    init(); 

    }]);

shoppingAppControllers.controller('PromotionDetailCtrl', ['$scope', '$routeParams', 'activeSupplierService',
  function($scope, $routeParams, activeSupplierService) {
    $scope.item = $routeParams.itemId.itemlize();
    $scope.list = [];
    $scope.current_img = '';

    $scope.setCurrentImg = function(img){
      $scope.current_img = img;
    };
    
    var init = function(){
      var obj = JSON.parse(localStorage[$scope.item]);
      $scope.list = _.filter(obj.saving, function(obj){
        return activeSupplierService.isSupplierActive(obj['supplier']);
      });
    };

    init();
  }]);

shoppingAppControllers.controller('TopSavingsCtrl', ['$scope', '$http', 'activeSupplierService',
  function($scope, $http, activeSupplierService) {
    
    $scope.list = [];
    $scope.allowMore = true;
    $scope.current_img = '';    

    $scope.setCurrentImg = function(img){
      $scope.current_img = img;
    };
    
    $scope.loadMore = function(){
      var local = localStorage['topSavings'];
      
      var savings = local == undefined ? [] : JSON.parse(localStorage['topSavings']); 

      $http.get('/promotion/topSavings?offset=' + savings.length).
      success(function(data, status, headers, config){
        savings = savings.concat(data);
        localStorage["topSavings"] = JSON.stringify(savings);

        if(savings.length >= 500)
        {  
          $scope.allowMore = false;
          return;
        }

        $scope.list = _.filter(savings, function(obj){
          return activeSupplierService.isSupplierActive(obj['supplier']);
        });

      });

    }

    var init = function(){
      var local = localStorage['topSavings'];
      if(local == undefined){
        return $scope.loadMore();
      }

      var savings = JSON.parse(local);
      $scope.allowMore = savings.length < 500;
      $scope.list = _.filter(savings, function(obj){
        return activeSupplierService.isSupplierActive(obj['supplier']);
      });
    };



    init();
  }]);


shoppingAppControllers.controller('ConfigCtrl', ['$scope', 'activeSupplierService',
  function($scope,activeSupplierService) {
    //this should be a global config for all the supported suppliers
    

    $scope.allSuppliers = activeSupplierService.getAllSuppliers();

   
    $scope.isSupplierActive = function(supplier){
      return activeSupplierService.isSupplierActive(supplier);
    }

    $scope.toggleActive = function(supplier){
      activeSupplierService.toggleActive(supplier);

    }
  }]);
