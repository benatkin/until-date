var express = require('express')
  , path = require('path');

var app = express();

// returns the current date or a fake date from the settings
function date() {
  return app.get('fakeDate') || new Date();
}

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index', { title: 'until.date.io' });
});

app.get(/\/(\d\d\d\d)\/(\d\d)\/(\d\d)\/?/, function(req, res) {
  if (! /\/$/.test(req.path)) {
    return res.redirect(req.path.replace(/$/, '/'));
  }
  var year = parseInt(req.params[0])
    , month = parseInt(req.params[1])
    , day = parseInt(req.params[2])
    , iso = [year, month, day].join('-');
  res.render('answer', { title: 'days until ' + iso });
});

module.exports = app;
