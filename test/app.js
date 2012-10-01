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

after(function(done) {
  try {
    server.close(done);
  } catch (e) {
    done();
  }
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
      done();
      expect(res.text).to.contain('days until');
    });
  });
});
