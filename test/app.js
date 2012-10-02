var app = require('../')
  , expect = require('chai').expect
  , request = require('superagent')
  , http = require('http')
  , server
  , rootUrl;

before(function(done) {
  app.set('port', process.env.PORT || 3001);
  rootUrl = 'http://localhost:' + app.get('port');
  server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));
    done();
  });
});

describe('home', function() {
  it('should return 200', function(done) {
    request.get(rootUrl + '/', function(res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should show how to use it', function(done) {
    request.get(rootUrl + '/', function(res) {
      expect(res.text).to.contain('days until');
      done();
    });
  });
});

describe('redirect', function() {
  it('should redirect a date without a trailing slash', function(done) {
    request.get(rootUrl + '/2012/04/20', function(res) {
      expect(res.req.path).to.equal('/2012/04/20/'); // follow redirect
      done();
    });
  });

  it('should permanently redirect to add a trailing slash', function(done) {
    request.get(rootUrl + '/2012/04/20').redirects(0).end(function(res) {
      expect(res.statusCode).to.equal(301);
      done();
    });
  });
});

describe('date', function() {
  it('should show the number of days for a future date', function(done) {
    request.get(rootUrl + '/2012/12/31/', function(res) {
      expect(res.text).to.match(/div.*answer/);
      done();
    });
  });

  it('should return the right number of days for a future date', function(done) {
    var savedCurrentDate = app.currentDate;
    app.currentDate = function() {
      return new Date(2012, 11, 26);
    }
    request.get(rootUrl + '/2012/12/31/', function(res) {
      expect(res.text).to.match(/div.*answer.*>5</);
      app.currentDate = savedCurrentDate;
      done();
    });
  });

  it('should return 0 for the same date', function(done) {
    var savedCurrentDate = app.currentDate;
    app.currentDate = function() {
      return new Date(2012, 09, 31);
    }
    request.get(rootUrl + '/2012/10/31/', function(res) {
      expect(res.text).to.match(/div.*answer.*>0</);
      app.currentDate = savedCurrentDate;
      done();
    });
  });
});
