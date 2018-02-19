var express = require('express')
  , path = require('path');

var app = express();

var secondsInDay = 1000 * 60 * 60 * 24;

// returns the current date or a fake date from the settings
app.currentDate = function() {
  var datetime = new Date()
    , midnight = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDay());
  return midnight;
}

function afterDeployment(date) {
  var deploymentDate = app.get('deployment date');
  if (typeof deploymentDate == 'string' && deploymentDate.length > 0) {
    var parts = deploymentDate.split('-')
      , year = parseInt(parts[0])
      , month = parseInt(parts[1])
      , day = parseInt(parts[2]);
    deploymentDate = new Date(year, month - 1, day);
    var ms = date.getTime() - deploymentDate.getTime()
    return Math.floor(ms / secondsInDay) >= 0;
  }
  return false;
}

function daysUntil(untilDate) {
  var ms = untilDate.getTime() - app.currentDate().getTime();
  return Math.floor(ms / secondsInDay);
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
  res.render('index', { title: 'until-date' });
});

function pad(n) {
  return (n < 10 ? '0' : '') + n;
}

app.get(/\/(\d\d\d\d)\/(\d\d)\/(\d\d)\/?/, function(req, res) {
  if (! /\/$/.test(req.path)) {
    return res.redirect(301, req.path.replace(/$/, '/'));
  }
  var year = parseInt(req.params[0])
    , month = parseInt(req.params[1])
    , day = parseInt(req.params[2])
    , iso = [year, pad(month), pad(day)].join('-')
    , date = new Date(year, month - 1, day)
    , days = daysUntil(date);
  
  if (days < 0) {
    var code = afterDeployment(date) ? 410 : 404;
    res.status(code);
    res.render('past', {
      title: iso + ' is in the past',
      code: code,
      message: afterDeployment(date) ? 'Gone' : 'Not Found'
    })
  } else {
    res.render('answer', {
      title: 'days until ' + iso, 
      days: days
    });
  }
});

app.get(/\/\d\d\d\d(\/\d\d)?\/?/, function(req, res) {
  res.redirect('/');
});

module.exports = app;
