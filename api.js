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
pro.contentful.access_token = '37e4f99b2ba5c765fd24465aee352bfe1b432b867fbf59f8bce86affd9f6eed9';
pro.contentful.space = '3yg4icqjbit3';
pro.contentful.types = {};
pro.contentful.types.category = '4ZtFRQqGfYI2YoiEQwkyKo';
pro.contentful.types.site = '30oK9ITXssOSSyUGwWWCOg';

////////////////////////////////////////////////////////////////////////////////////////////////////
// VIEW
var view = {};
pro.contentful.entries('category', function(output) {
	view['category'] = output;
});
pro.contentful.entries('site', function(output) {
	view['site'] = output;
	for (var si in view.site.items) {
		view.site.items[si].link = view.site.items[si].url.replace(/{{date:([\w-\/.:\[\]\ ]*)}}/g, function(match, one) {
			return pro.moment.now.format(one);
		});
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// POST SITES
process.app.post('/sites', function(request, response) {
	var sites = view.site;
	// var moreSites = {
	// 	items: {
	// 		"http://162.243.253.46": {
	// 			"url": "http://162.243.253.46",
	// 			"link": "http://162.243.253.46",
	// 			"name": "Paul Shorey",
	// 			"eItem": ".snippet-blog",
	// 			"eChildren": "{}"
	// 		}
	// 	}
	// };
	// sites.items = pro._.extend(sites.items, moreSites.items);
	//process.console.log('sites', sites);
	if (sites.items) {
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(pro.fun.stringify_once(sites.items));
		response.end();
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////////
// POST SITE
process.app.post('/site', function(request, response) {
	// validate
	if (!request.body.site || !request.body.site.meta || !request.body.site.items) {
		// fail
		var error = {
			code: 510,
			message: '/site POST requires request.body.site == {meta:{},items:{}}'
		}
		process.console.warn(error.message);
		process.response.json(response, error);
		return false;
	}
	if (!pro.fs.existsSync('./site')) {
		pro.fs.mkdirSync('./site');
	}
	// edit
	var post = {};
	post.items = request.body.site.items;
	post.meta = request.body.site.meta;
	// save
	var sid = pro.fun.url_uid(request.body.site.meta.url);
	pro.console.log('site url: ' + request.body.site.meta.url);
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
