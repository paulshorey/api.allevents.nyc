var fs = require('fs'),
	express = require('express'),
	http = require('http'),
	app = express();

app.set('port', 9999);

app.all('/_deploy', function(req, res) {

	// done
	res.json(200, {
		message: 'Github Hook received!'
	});

	// apply
	var spawn = require('child_process').spawn,
		deploy = spawn('sh', ['_deploy.sh']);

});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

