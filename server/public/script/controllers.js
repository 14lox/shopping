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
        $scope.showError = true;
        $scope.errMsg = "Item already exists in the list";
       return;
     }

     if(_.some($scope.boughtList, function(item){
        return item.name == $scope.newItem;
      })){
        $scope.showError = true;
        $scope.errMsg = "Item already exists in the boutght list, you can revert it to shopping list.";
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
      var obj = _.find($scope.list, function(element){
        return element.name == item;
      });
      var idx = _.indexOf($scope.list, obj);
      //remove from list
      $scope.list.splice(idx, 1);

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

    $scope.showItem = function(itemName){
        var url = "#/items/" + itemName 
        $scope.navTo(encodeURI(url));
    }

    $scope.navTo = function(url){
      $window.location.href = url;
    }

    $scope.refresh = function(){
      $scope.showSpinner = true;
      $http.post('/promotion/post_bulkquery', {queries: _.pluck($scope.list, 'name')}).
        success(bulk_query_succeeded).
        error(function(){
          $scope.showSpinner = false;
          $scope.showError = true;
          $scope.errMsg = "Sorry, cannot refresh at the moment. Please try later";
        });

      $http.get('/promotion/topSavings').
      success(function(data, status, headers, config){
        localStorage["topSavings"] = JSON.stringify(data);
      });
    };

     $scope.closeError = function(){
      $scope.showError = false;
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

      window.scrollTo(0,1) 

      sortList();

      processExpire();

      getTopSavings();

      showServerMessageIfAny();
    };

    var showServerMessageIfAny = function(){
      $http.get('/promotion/serverMessage').
      success(function(data){
        if(data != ''){
          alert(data)
        }
      });
    }

    var sortList = function(){
      $scope.boughtList = _.sortBy($scope.boughtList, function(item){return item.order });
      _.map($scope.list, function(item){if (item.order == -1) { item.order = ++itemOrder; }});
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
        return;
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

shoppingAppControllers.controller('PromotionDetailCtrl', ['$scope', '$routeParams', 'activeSupplierService','$window',
  function($scope, $routeParams, activeSupplierService, $window) {
    $scope.item = $routeParams.itemId.itemlize();
    $scope.list = [];
    $scope.current_img = '';
    $scope.showSpinner = false;


    $scope.showImg = function(img){
      $scope.current_img = '/image/spinner.gif';
      $scope.showSpinner = true;

      $scope.image = {
          path: "",
      }

      var imgObj = new Image();
      imgObj.onload = function () {
        $scope.$apply(function() {
          $scope.current_img = img;
        });
      }
      imgObj.src = img;

    }

    $scope.hideSpinner = function(){
      $scope.showSpinner = false;
    }
    
    $scope.addToList = function(item){
      var itemName = ('[' +item["supplier"] + '] ' + item["name"]).itemlize();
      if(localStorage[itemName] != undefined){
         $scope.showError = true;
         $scope.errMsg = "Item is already in your shopping list";
        return;
      }
      var dataStr = JSON.stringify({order: -1, bought:false, saving: [item]});
      localStorage.setItem(itemName, dataStr);

      var index = $scope.list.indexOf(item);
      if (index > -1) {
          $scope.list.splice(index, 1);
      }
    }

     $scope.closeError = function(){
      $scope.showError = false;
    }

    $scope.navTo = function(url){
      $window.location.href = url;
    }

    $scope.toggleDetailStyle = function(category){
      if($scope.detailStyle[category] == 'none')
        $scope.detailStyle[category] = 'block';
      else
        $scope.detailStyle[category] = 'none';
    }


    var init = function(){
      var obj = JSON.parse(localStorage[$scope.item]);
      // $scope.list = _.filter(obj.saving, function(obj){
      //   return activeSupplierService.isSupplierActive(obj['supplier']);
      // });

      var list = _.filter(obj.saving, function(obj){
        return activeSupplierService.isSupplierActive(obj['supplier']);
      });

      $scope.groups = _.groupBy(list, 'category');
      $scope.categories = Object.keys($scope.groups);

      if($scope.groups.length == 1)
        $scope.detailStyle = {$scope.groups[0] : 'block'};
      else
        $scope.detailStyle = _.map($scope.groups, function(group) {{group: 'none'}});
    };

    init();
  }]);

shoppingAppControllers.controller('TopSavingsCtrl', ['$scope', '$http', '$timeout','activeSupplierService', '$window',
  function($scope, $http, $timeout, activeSupplierService, $window) {
    
    $scope.list = [];
    $scope.allowMore = true;
    $scope.current_img = '';    
    $scope.showSpinner = false;


    $scope.showImg = function(img){
      $scope.current_img = '/image/spinner.gif';
      $scope.showSpinner = true;

      $scope.image = {
          path: "",
      }

      var imgObj = new Image();
      imgObj.onload = function () {
        $scope.$apply(function() {
          $scope.current_img = img;
        });
      }
      imgObj.src = img;

    }

    $scope.hideSpinner = function(){
      $scope.showSpinner = false;
    }
   
    $scope.addToList = function(item){
      var itemName = ('[' +item["supplier"] + '] ' + item["name"]).itemlize();
      if(localStorage[itemName] != undefined){
         $scope.showError = true;
         $scope.errMsg = "Item is already in your shopping list";
        return;
      }
      var dataStr = JSON.stringify({order: -1, bought:false, saving: [item]});
      localStorage.setItem(itemName, dataStr);

      var index = $scope.list.indexOf(item);
      if (index > -1) {
          $scope.list.splice(index, 1);
      }
    }

     $scope.closeError = function(){
      $scope.showError = false;
    }
    
    $scope.loadMore = function(){
      var local = localStorage['topSavings'];
      
      var savings = local == undefined ? [] : JSON.parse(localStorage['topSavings']); 
      $scope.current_img = '/image/spinner.gif';
      $scope.showSpinner = true;

      $http.get('/promotion/topSavings?offset=' + savings.length).
      success(function(data, status, headers, config){
        savings = savings.concat(data);
        localStorage["topSavings"] = JSON.stringify(savings);

        $scope.list = _.filter(savings, function(obj){
          return activeSupplierService.isSupplierActive(obj['supplier']);
        });

        $scope.showSpinner = false;

        if(savings.length >= 500)
        {  
          $scope.allowMore = false;
        }

      });

    }

    $scope.navTo = function(url){
      $window.location.href = url;
    }

    var init = function(){
      $scope.current_img = '/image/spinner.gif';
      $scope.showSpinner = true;
      $scope.list = [];
      $scope.allowMore = false;
    }


    init();

    $timeout(function() {
          var local = localStorage['topSavings'];
          if(local == undefined){
            return $scope.loadMore();
          }

          var savings = JSON.parse(local);
          $scope.allowMore = savings.length < 500;
          $scope.list = _.filter(savings, function(obj){
            return activeSupplierService.isSupplierActive(obj['supplier']);
          });

          $scope.showSpinner = false;
        });
  }]);


shoppingAppControllers.controller('ConfigCtrl', ['$scope', 'activeSupplierService','$window',
  function($scope,activeSupplierService, $window) {
    //this should be a global config for all the supported suppliers
    

    $scope.allSuppliers = activeSupplierService.getAllSuppliers();

   
    $scope.isSupplierActive = function(supplier){
      return activeSupplierService.isSupplierActive(supplier);
    }

    $scope.toggleActive = function(supplier){
      activeSupplierService.toggleActive(supplier);
    }

    $scope.navTo = function(url){
      $window.location.href = url;
    }
  }]);
