'use strict';

/* Services */
var services = angular.module('shoppingServices', []);

services.provider('activeSupplierService', function () {
		
	this.suppliers = {'Coles':1, 'Wollies':2};
	this.activeSuppliers = parseInt(localStorage['activeSuppliers']);
  	if(this.activeSuppliers == NaN){
    	//default to select all, so it is 2^n - 1
    	this.activeSuppliers = Math.pow(2, _.keys(suppliers).length) - 1;
  	}

	this.$get = function() {
        var suppliers = this.suppliers;
        var activeSuppliers = this.activeSuppliers;
        return {
            isSupplierActive : function(supplier){
      			var val = suppliers[supplier];
      			return (activeSuppliers & val) != 0;
    		},

    		toggleActive : function(supplier){
      			var mask = 1 << suppliers[supplier]-1;

      			activeSuppliers ^= mask;
      			localStorage['activeSuppliers'] = activeSuppliers;

    		},

    		getActiveSuppliers : function(){
		      	return activeSuppliers;
    		},

    		getAllSuppliers : function(){
    			return _.keys(suppliers);
    		}
        } 		
    };
});


