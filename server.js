var db = require("./db.js");
var app = require("./app.js")(db);
var http = require('http');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});