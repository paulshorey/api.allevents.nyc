exports.json = function(response, body) {
	if (!response) {
		process.console.error('response.json requires arguments (response, body)');
	}
	if (body.status=="error") {
		process.response.json.error(response,body);
	} else if (body.data || body.status=="success") {
		process.response.json.success(response,body);
	} else {
		process.response.json.error(response,body);
	}
};
exports.json.error = function(response,body) {
	var code = parseInt(body.code);
	if (! ( code>99 && code <999 ) ) {
		code = 500;
	}
	body = process.fun.stringify_once(body);
	//body = process.fun.stripslashes(body);
	
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(code);
	response.write(body);
	response.end();
};
exports.json.success = function(response,body) {
	body = process.fun.stringify_once(body);
	//body = process.fun.stripslashes(body);
	
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