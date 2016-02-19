exports.json = function(response, body) {
	if (!response) {
		process.console.error('response.json requires (response, body)');
	}
	// assume success
	if (body.status=="error" || body.code>=300) {
		process.response.json.error(response,body);
	} else {
		process.response.json.success(response,body);
	}
};
exports.json.error = function(response,body) {
	var code = parseInt(body.code);
	if (! ( code>99 && code <999 ) ) {
		code = 500;
	}
	body = JSON.stringify(body);
	
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(code);
	response.write(body);
	response.end();
};
exports.json.success = function(response,body) {
	if (!body) {
		body = { data: {} };
	} else if (!body.data) {
		body = { data: body };
	}
	body = JSON.stringify(body);
	
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(body);
	response.end();
};

exports.html = function(response, body) {
	response.setHeader('Content-Type', 'text/html');
	response.writeHead(200);
	response.write(body);
	response.end();
};