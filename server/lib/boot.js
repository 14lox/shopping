var fs = require('fs');
var express = require('express');

module.exports = function(parent, option){
	var verbose = option.verbose;
	fs.readdirSync(__dirname + '/../controllers').forEach(function(name){
	if(name.indexOf('.') == 0) {return;}
	
	verbose && console.log('\n   %s', name);
	var obj = require('./../controllers/' + name)
	,name = obj.name || name
	,prefix = obj.prefix || ''
	,app = express()
	,method
	,path;
	if(obj.engine) app.set('view engine', obj.engine);
	app.set('views', __dirname + '/../controllers/' + name + '/views')

	if(obj.before) {
		path = '/' + name + '/*';
		app.all(path, obj.before);
		verbose && console.log('	ALL %s -> before', path);
		path = '/' + name;
		app.all(path, obj.before);
		verbose && console.log('	ALL %s -> before', path);
	}

	for (var key in obj){
		if(~['name', 'prefix', 'engine', 'before'].indexOf(key)) continue;
			//route exports
			method = key.indexOf("post") == 0 ? 'post':'get',
			
			path=prefix + '/'+name +'/' + key;
			

			app[method](path, obj[key]);
			verbose && console.log('	%s %s -> %s', method.toUpperCase(), path, key);
		}
		parent.use(app);
	});
};