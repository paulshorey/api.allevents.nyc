var pro = process;
pro.inc = {};
pro.inc.express = require('express');
pro.inc.express_parser = require('body-parser');
// modules
pro.moment = require('moment'); // pro.moment(new Date(2011, 9, 16)).
pro.moment.now = pro.moment();
pro.request = require('request');
pro.fs = require('fs');
pro.q = require('q');
pro._ = require('underscore');

// env
pro.env.PORT = 8000;
pro.env.PATH = __dirname;
// app
pro.app = pro.inc.express();
pro.app.use(pro.inc.express_parser.json({
	limit: '50mb'
}));
pro.app.use(pro.inc.express_parser.urlencoded({
	limit: '50mb',
	extended: true
}));
// custom
pro.fun = require("./node_custom/fun.js");
pro.console = require("./node_custom/console.js").console; // uses pro.app
pro.response = require("./node_custom/response.js");
pro.backand = require("./node_custom/backand.js");
// secret
pro.secret = require('../secret.nyc/all.js');
// contentful
pro.contentful = require("./node_custom/contentful.js");
pro.contentful.access_token = '2275b86b0346a8f71ac2d012c153c7e50281f9c13f4d71af7d543a8557889ba3';
pro.contentful.space = 'whctzlb9j9p2';
pro.contentful.types = {};
pro.contentful.types.site = 'site';

////////////////////////////////////////////////////////////////////////////////////////////////////
// VIEW
var view = {};
pro.contentful.entries('site', function(output) {
	view.site = output;
	for (var si in view.site.items) {
		view.site.items[si].host = view.site.items[si].url.match(/(^https?:\/\/[a-z.-]*[a-z]*)/)[1];
		view.site.items[si].link = view.site.items[si].url.replace(/{{date:([\w-\/.:\[\]\ ]*)}}/g, function(match, one) {
			return pro.moment.now.format(one);
		});
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// HOOK
process.app.all('/hook', function(request, response) {
	process.exit();
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SITES
process.app.get('/sites', function(request, response) {
	process.console.log('view.site.items', view.site.items);
	if (view.site.items) {
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(pro.fun.stringify_once(view.site.items));
		response.end();
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// POST SITE
process.app.post('/site', function(request, response) {
	// validate
	if (!request.body.site || !request.body.site.url || !request.body.site.items) {
		// fail
		var error = {
			code: 510,
			message: '/site POST requires request.body.site == {url:string,items:{}}'
		}
		process.console.warn(error.message);
		process.response.json(response, error);
		return false;
	}
	if (!pro.fs.existsSync('./site')) {
		pro.fs.mkdirSync('./site');
	}
	// edit
	var post = request.body.site;
	// save
	var sid = pro.fun.url_uid(request.body.site.url);
	pro.console.log('site url: ' + request.body.site.url);
	pro.console.log('writeFile: ./site/' + sid + '.json');
	var file = process.fs.writeFile(
		'./site/' + sid + '.json',
		JSON.stringify(post),
		'utf8',
		function(error) {
			// response: error
			if (error) {
				process.response.json(response, {
					status: 'error',
					message: "Couldn't write file .json"
				});
				return false;
			}
			// response: success
			process.response.json(response, {});
		});

});


//////////////////////////////////////////////////////////////////////////////////////////////////
// GET SITE
process.app.get('/site', function(request, response) {
	// validate
	if (!request.query.url || request.query.url.indexOf('http') !== 0) {
		// fail
		var error = {
			code: 511,
			message: 'GET /site requires ?url=http://...'
		}
		process.console.warn(error.message);
		process.response.json(response, error);
		return false;
	}
	if (!pro.fs.existsSync('./site')) {
		pro.fs.mkdirSync('./site');
	}
	// get
	var sid = pro.fun.url_uid(request.query.url);
	pro.console.log('site url: ' + request.query.url);
	pro.console.log('readFile: ./site/' + sid + '.json');
	pro.fs.readFile('./site/' + sid + '.json', 'utf8', function(error, site) {
		if (site) {
			// response: success
			process.response.json(response, JSON.parse(site));
		} else {
			// response: error
			process.response.json(response, {
				status: 'error',
				message: "Couldn't find site file .json"
			});
			return false;
		}
	});
});


// ////////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////
// // 404
// process.app.all('*', function(request, response) {
// 	// fail
// 	var error = {
// 		code: 400,
// 		status: "error",
// 		message: 'Page not found - bad request'
// 	};
// 	process.console.warn(error.message);
// 	process.response.json(response, error);
// });


////////////////////////////////////////////////////////////////////////////////////////////////////
process.app.listen(pro.env.PORT, function() {
	process.console.log("Node app is running at localhost: " + pro.env.PORT);
});
