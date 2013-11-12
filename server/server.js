
/**
* Module dependencies.
*/

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , config = require('./configure')
  , db = require('./lib/db.js')
  , config = require('./configure.js')

var app = express();

app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', config.port || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-locals'));
app.use(express.logger('dev'));
app.use(express.cookieParser(config.cookieSecret));
app.use(express.session())
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.use(function (req, res, next) {
    console.log('new request from ' + req.path);
    next();
});

app.get('/', function (req, res, next) {
    require("./routes/index").index(req, res);
});


require('./lib/boot')(app, { verbose: true });

app.use(function (err, req, res, next) {
    console.log('did not find resource');
    if (~err.message.indexOf('not found')) return next();

    console.error(err.stack);

    res.status(500).render('5xx');
});

app.use(function (req, res, next) {
    res.status(404).render('404', { url: req.originalUrl });
});


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
