var app = require('./')
  , http = require('http')
  , server = http.createServer(app);

module.exports = server;

if (! module.parent) {
  app.set('port', process.env.PORT || 3000);
  app.set('deployment date', process.env.DEPLOYMENT_DATE);
  server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
  });
}
