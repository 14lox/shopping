
var Db = require('./db.js');

var supplierMap = {1: "Coles", 2:"Wollies", 3: "Aldi"};
var getSupplier = function(id) {
	return supplierMap[id];
}

module.exports.getSupplier = getSupplier;
