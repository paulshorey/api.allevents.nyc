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
pro.contentful = require('contentful');
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
// secret
pro.secret = require('../secret.nyc/all.js');
// contentful
process.contentful.myClient = pro.contentful.createClient({
  space: 'whctzlb9j9p2',
  accessToken: '2275b86b0346a8f71ac2d012c153c7e50281f9c13f4d71af7d543a8557889ba3'
  // ,secure: true
  // ,host: 'cdn.contentful.com'
  // ,resolveLinks: true
  // agent: agentInstance
});
process.contentful.myEntries = function(entries){
	for (var index in entries) {
		if (entries[index].sys && entries[index].fields) {
			entries[index] = entries[index].fields;
			for (var field in entries[index]) {
				if (typeof entries[index][field] == 'object') {
					entries[index][field] = process.contentful.myEntries(entries[index][field]);
				}
			}
		}
	}
	return entries;
};


////////////////////////////////////////////////////////////////////////////////////////////////////
// VIEW
var view = {};
// sites
view.getContent = function(item,items){ // contentful content_type , file and variable name plural.json
	view[items] = {};
	
	pro.contentful.myClient.entries({ content_type: item })
	.then(function(items_new) {
		// cloud
		items_new = process.contentful.myEntries(items_new, undefined, item); // from contentful
		// file
		pro.fs.readFile('./data/'+items+'.json', 'utf8', function(error, items_old) {
			// readFile
			items_old = JSON.parse(items_old)||{}; // from file
			// memory
			if (items_new) {
				for (var si in items_new) {
					if (items_old[si]) {
						view[items][si] = pro._.extend(items_old[si],items_new[si]);
					} else {
						view[items][si] = items_new[si];
					}
					// site only
					if (item=='site') {
						view[items][si].host = view[items][si].url.match(/(^https?:\/\/[a-z.-]*[a-z]*)/)[1];
						view[items][si].link = view[items][si].url.replace(/{{date:([\w-\/.:\[\]\ ]*)}}/g, function(match, one) {
							return pro.moment.now.format(one);
						});
					}
				}
				// writeFile
				if (!pro.fs.existsSync('./data')) {
					pro.fs.mkdirSync('./data');
				}
				var file = process.fs.writeFile(
					'./data/'+items+'.json',
					JSON.stringify(view[items]),
					'utf8',
					function(error) {
						if (error) {
							process.console.error('Couldn not write file ./data/'+items+'.json');
							return false;
						}
					}
				);
			}
		});
	});
};
view.getContent('site','sites');
view.getContent('category','categories');


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// HOOK
process.app.all('/hook', function(request, response) {
	view.getContent('site','sites');
	view.getContent('category','categories');
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SITES
process.app.get('/sites', function(request, response) {
	process.console.log('get /sites');
	if (view.sites) {
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(JSON.stringify(view.sites));
		response.end();
	}
});
process.app.get('/categories', function(request, response) {
	process.console.log('get /categories');
	if (view.categories) {
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(JSON.stringify(view.categories));
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
		process.console.error(error.message);
		process.response.json(response, error);
		return false;
	}
	if (!pro.fs.existsSync('./data/sites')) {
		pro.fs.mkdirSync('./data/sites');
	}
	
	// site
	var site = request.body.site;
	var sid = pro.fun.url_uid(request.body.site.url);
	pro.console.log('post site: ' + request.body.site.url);
	var file = process.fs.writeFile(
		'./data/sites/' + sid + '.json',
		JSON.stringify(site),
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
		}
	);

	// sites
	view.sites[site.url] = site;
	var file = process.fs.writeFile(
		'./data/sites.json',
		JSON.stringify(view.sites),
		'utf8',
		function(error) {
			if (error) {
				process.console.error("Couldn't write file ./data/sites.json");
				return false;
			}
		}
	);
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
	if (!pro.fs.existsSync('./data/sites')) {
		pro.fs.mkdirSync('./data/sites');
	}
	// get
	var sid = pro.fun.url_uid(request.query.url);
	pro.console.log('get site: ' + request.query.url);
	pro.fs.readFile('./data/sites/' + sid + '.json', 'utf8', function(error, site) {
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
