var express = require('express');
var app = new express();

var staticPath = __dirname + '/../../dist'

console.log('static path is', staticPath);

app.use('/', express.static(staticPath));

var server = app.listen(8080, function() {
	console.log('Listening on port %d', server.address().port);
});
