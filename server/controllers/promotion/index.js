var SphinxClient = require ("sphinxapi"),
    util = require('util'),
    helper = require('../../lib/helper.js'),
    Db = require('../../lib/db.js'),
    async = require('async');

exports.post_query = function(req, res, next){
	console.log(util.inspect(req));	
	console.log('get query ' + req.body.query);
	var cl = new SphinxClient();
	cl.SetServer('54.252.90.204', 9312);

	var query = req.body.query;

	cl.Query(query, function(err, result) {
		async.map(result.matches, getPromotionContent, function(err,results){
			console.log('-----------')
			console.log(results);	
			res.send(results);	
		});
	});
}

getPromotionContent = function(match,callback){
	console.log(match);
	var query = 'SELECT content from Current where id = ' + match.id;
	Db.runQuery(query)
	.then(function(result){
		callback(null,{"supplier": helper.getSupplier(match.attrs.supplierid), "content":result[0].content});
	})
	.done();

}
