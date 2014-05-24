
var mysql = require('mysql')
,Q = require('q');

var pool  = mysql.createPool({
   host     : 'localhost',
   user     : 'harrygao',
   password : 'topview1',
   database : 'promotion',
});




function Db(){
    Db.prototype.runQuery = function(query){
        var deferred = Q.defer();
        pool.getConnection(function(err, connection) {
            if(err){
              console.log(err);
              deferred.reject(new Error(err));
            }
            else{
              connection.query( query, function(err, result) {
                  if (err) {
                      console.log(err);
                      console.log('query is ' + query);
                      deferred.reject(new Error(err));
                  } else {
                      deferred.resolve(result);
                  }
              });
            connection.release();
            }
        });

        return deferred.promise;
    }
}

module.exports = new Db();