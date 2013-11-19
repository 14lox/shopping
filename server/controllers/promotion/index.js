var SphinxClient = require ("sphinxapi"),
    util = require('util'),
    helper = require('../../lib/helper.js'),
    Db = require('../../lib/db.js'),
    async = require('async'),
    _ = require('underscore');

//return sample {item: egg, promotions: [{supplier:'coles', name: 'free range egg', newPrice:'1.99', oldPrice:'2:99', save: 20}, {...}]}
exports.post_query = function(req, res, next){
	console.log('get query ' + req.body.query);
	var cl = new SphinxClient();
	cl.SetServer('54.252.90.204', 9312);
	cl.SetLimits(0, 50);
	var query = req.body.query;

	cl.Query(query, function(err, result) {
		async.map(result.matches, getPromotionContent, function(err,results){
			results = results.sort(function(item1, item2){return item1.save - item2.save}).reverse();
			res.send({item: query, promotions: results});	
		});
	});
}

exports.post_bulkquery = function(req, res, next){
	console.log('get query ' + req.body.queries);
	
	var queries = req.body.queries;
	async.parallel(
		_.map(queries, function(query){ return generateQueryFunc(query)}),
		function(err, results){
			_.each(results, function(r){console.log('result for item ' + r.item)})
			res.send(results);
		}
		);
	// _.each(queries, function(query){results.push({"item": query, 
	// 	"promotions":[{"supplier": "Coles", "name": "save 10", "newPrice":"100", "oldPrice":"200", "save":"50", "img":"none"}]})});
}

exports.isExpired = function(req, res, next){
	var lastRefreshTime = parseInt(req.query.lastRefreshTime);

	var query = 'SELECT updateTime from UpdateHistory order by id desc limit 1';
	Db.runQuery(query)
	.then(function(result){
		var updateTime = parseInt(result[0].updateTime);
		res.send(updateTime < lastRefreshTime ? 'false' : 'true');
	})
	.done();

}

getPromotionContent = function(match,callback){
	var query = 'SELECT name, newPrice, oldPrice, save, img from Current where id = ' + match.id;
	Db.runQuery(query)
	.then(function(result){
		callback(null,{"supplier" : helper.getSupplier(match.attrs.supplierid), 
						"name" : result[0].name,
						"newPrice" : result[0].newPrice,
						"oldPrice" : result[0].oldPrice,
						"save" : result[0].save,
						"img" : result[0].img});
	})
	.done();

}

generateQueryFunc = function(query){
	return function(callback){
		var cl = new SphinxClient();
		cl.SetServer('54.252.90.204', 9312);
		cl.SetLimits(0, 50);
		cl.Query(query, function(err, result) {
				async.map(result.matches, getPromotionContent, function(err,results){
					results = results.sort(function(item1, item2){return item1.save - item2.save}).reverse();

			 		callback(err, {item: query, promotions: results});	
				});
		});
	}
}
