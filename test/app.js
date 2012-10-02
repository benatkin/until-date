var app = require('../')
  , expect = require('chai').expect
  , request = require('superagent')
  , http = require('http')
  , server
  , rootUrl;

before(function(done) {
  app.set('port', process.env.PORT || 3001);
  app.set('deployment date', '2012-10-02');
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

  it('should redirect years (for now)', function(done) {
    request.get(rootUrl + '/2012/', function(res) {
      expect(res.req.path).to.equal('/');
      done();
    });
  });

  it('should redirect months (for now)', function(done) {
    request.get(rootUrl + '/2012/12', function(res) {
      expect(res.req.path).to.equal('/');
      done();
    });
  });

  
  it('should return 404 for invalid url', function(done) {
    request.get(rootUrl + '/99', function(res) {
      expect(res.statusCode).to.equal(404);
      done();
    });
  });
});

var originalCurrentDate = app.currentDate;

function setDate(year, month, day) {
  app.currentDate = function() {
    return new Date(year, month - 1, day);
  }
}

function restoreDate() {
  app.currentDate = originalCurrentDate;
}

describe('date', function() {
  it('should return 200 code and show the number of days for a future date', function(done) {
    setDate(2012, 10, 20);
    request.get(rootUrl + '/2012/12/31/', function(res) {
      expect(res.text).to.match(/div.*answer/);
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should return the right number of days for a future date', function(done) {
    setDate(2012, 12, 26);
    request.get(rootUrl + '/2012/12/31/', function(res) {
      expect(res.text).to.match(/div.*answer.*>5</);
      restoreDate();
      done();
    });
  });

  it('should return 200 code and 0 days for the same date', function(done) {
    setDate(2012, 10, 31);
    request.get(rootUrl + '/2012/10/31/', function(res) {
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.match(/div.*answer.*>0</);
      restoreDate();
      done();
    });
  });

  it('should return 404 code and show a message for a past date', function(done) {
    setDate(2012, 10, 31);
    request.get(rootUrl + '/2012/04/20/', function(res) {
      expect(res.statusCode).to.equal(404);
      expect(res.text).to.contain('in the past');
      restoreDate();
      done();
    });
  });

  it('should return 404 code for the previous day', function(done) {
    setDate(2012, 04, 21);
    request.get(rootUrl + '/2012/04/20/', function(res) {
      expect(res.statusCode).to.equal(404);
      restoreDate();
      done();
    });
  });

  it('should return 410 code for a past date after deployment', function(done) {
    setDate(2012, 10, 31);
    request.get(rootUrl + '/2012/10/30/', function(res) {
      expect(res.statusCode).to.equal(410);
      restoreDate();
      done();
    });
  });

  it('should return 404 when no deployment date set', function(done) {
    var oldDeploymentDate = app.get('deployment date');
    app.set('deployment date', undefined);
    setDate(2012, 10, 31);
    request.get(rootUrl + '/2012/10/30/', function(res) {
      expect(res.statusCode).to.equal(404);
      app.set('deployment date', oldDeploymentDate);
      restoreDate();
      done();
    });
  });

});
