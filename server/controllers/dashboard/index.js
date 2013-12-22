var Db = require('../../lib/db.js');

exports.index = function(req, res, next){
  Db.runQuery('SELECT count(*) as total from QueryHistory')
    .then(function(result){
        res.render('index', {total: result[0]['total']}); 
    })
    .done();
}