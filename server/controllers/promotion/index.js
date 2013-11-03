var SphinxClient = require ("sphinxapi"),
    util = require('util'),
    helper = require('../../lib/helper.js'),
    Db = require('../../lib/db.js'),
    async = require('async');

//return sample {item: egg, promotions: [{supplier:'coles', name: 'free range egg', newPrice:'1.99', oldPrice:'2:99', save: 20}, {...}]}
exports.post_query = function(req, res, next){
	console.log('get query ' + req.body.query);
	var cl = new SphinxClient();
	cl.SetServer('54.252.90.204', 9312);
	var query = req.body.query;

	cl.Query(query, function(err, result) {
		async.map(result.matches, getPromotionContent, function(err,results){
			res.send({item: query, promotions: results});	
		});
	});
}

getPromotionContent = function(match,callback){
	console.log(match);
	var query = 'SELECT name, newPrice, oldPrice, save from Current where id = ' + match.id;
	Db.runQuery(query)
	.then(function(result){
		callback(null,{"supplier" : helper.getSupplier(match.attrs.supplierid), 
						"name" : result[0].name,
						"newPrice" : result[0].newPrice,
						"oldPrice" : result[0].oldPrice,
						"save" : result[0].save});
	})
	.done();

}
