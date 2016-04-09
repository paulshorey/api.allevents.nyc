var pro = process;
process.inc = {};
process.inc.express = require('express');
process.inc.express_parser = require('body-parser');
// modules
process.moment = require('moment'); // process.moment(new Date(2011, 9, 16)).
process.moment.now = process.moment();
process.request = require('request');
process.fs = require('fs');
process.q = require('q');
process._ = require('underscore');
process.contentful = require('contentful');
//process.mkdirp = require('mkdirp');
// env
process.env.PORT = 1080;
process.env.PATH = __dirname;
// app
process.app = process.inc.express();
process.app.use(process.inc.express_parser.json({
	limit: '50mb'
}));
process.app.use(process.inc.express_parser.urlencoded({
	limit: '50mb',
	extended: true
}));
process.app.use(process.inc.express.static('public'));
// custom
process.fun = require("./node_custom/fun.js");
process.console = require("./node_custom/console.js").console; // uses process.app
process.response = require("./node_custom/response.js");
// secret
process.secret = require('../secret-nyc/all.js');
// contentful (sites)
process.contentful.myClient = process.contentful.createClient({
  space: process.secret.contentful_delivery.space,
  accessToken: process.secret.contentful_delivery.access_token
  // ,secure: true
  // ,host: 'cdn.contentful.com'
  // ,resolveLinks: true
  // agent: agentInstance
});
// mongoose (items)
process.mongoose = require('mongoose');
process.mongoose.connect('mongodb://localhost/api');


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// MODEL
var model = {};
// contentful
model.contentful = {};
model.contentful.myEntries = function(entries){
	for (var index in entries) {
		if (entries[index].sys && entries[index].fields) {
			entries[index] = entries[index].fields;
			for (var field in entries[index]) {
				if (typeof entries[index][field] == 'object') {
					entries[index][field] = model.contentful.myEntries(entries[index][field]);
				}
			}
		}
	}
	return entries;
};
model.contentful.getContent = function(item,items){ 
	// gets {{item}}, saves to global variable view[{{items}}]
	view[items] = {};
	process.contentful.myClient.entries({ content_type: item })
	.then(function(items_new) {
		items_new = model.contentful.myEntries(items_new, undefined, item); // from contentful
		if (items_new) {
			for (var si in items_new) {
				// memory
				view[items][si] = items_new[si];
				// tweak
				if (item=='site') {
					view[items][si].host = view[items][si].url.match(/(^https?:\/\/[a-z.-]*[a-z]*)/)[1];
					view[items][si].link = view[items][si].url.replace(/{{date:([\w-\/.:\[\]\ ]*)}}/g, function(match, one) {
						return process.moment.now.format(one);
					});
				}
			}
		}
	});
};
// mongoose
model.mongoose = {};
model.mongoose.schemas = {};
model.mongoose.schemas.item = { 
	_id: String,
	text: { type:String, required: true },
	time: { type:Number, required: true },
	img: String,
	link: String,
	categories: { type:Array, default: [] },
	scenes: { type:Array, default: [] },
	venue: String,
	source: String,
	timeAdded: { type:Number, default: Date.now() },
	likes: { type:Number, default: 0 },
	site: { 
		link: { type:String, default: '' },
		title: { type:String, default: '' }
	}

};
model.mongoose.item = process.mongoose.model('Item', model.mongoose.schemas.item);


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// VIEW
var view = {};
// view.sites
model.contentful.getContent('site','sites');
model.contentful.getContent('category','categories');
model.contentful.getContent('scene','scenes');
process.app.all('/hook/contentful', function(request, response) {
	process.console.warn('/hook/contentful');
	model.contentful.getContent('site','sites');
	model.contentful.getContent('category','categories');
	model.contentful.getContent('scene','scenes');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write('');
	response.end();
});
process.app.all('/_hook/contentful', function(request, response) {
	process.console.warn('/hook/contentful');
	model.contentful.getContent('site','sites');
	model.contentful.getContent('category','categories');
	model.contentful.getContent('scene','scenes');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write('');
	response.end();
});
// view.items
// not in memory, query model.mongoose.item.find({},callback);


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SITES
process.app.get('/all', function(request, response) {
	process.console.log('get /sites');
	var all = {};
		all.sites = view.sites || {};
		all.categories = view.categories || {};
		all.scenes = view.scenes || {};
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:all, error:0},null,"\t"));
	response.end();
});
process.app.get('/sites', function(request, response) {
	process.console.log('get /sites');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.sites, error:0},null,"\t"));
	response.end();
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// GET ITEMS
process.app.get('/items', function(request, response) {
	process.console.log('get /items');
	
	model.mongoose.item.find(function(err, items){
		if (err) {
			return process.console.warn(err);
		} else {
			var all = {};
				all.items = items;
			response.setHeader('Content-Type', 'application/json'); 
			response.writeHead(200);
			response.write(JSON.stringify({data:all, error:0},null,"\t"));
			response.end();
		}
	});
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// POST ITEMS
process.app.post('/items', function(request, response) {
	process.console.log('post /items');
	process.console.log(JSON.stringify(request.body.items));
	
	for (var it = 0; it < request.body.items.length; it++) {
		var item = request.body.items[it];
			item._id = process.fun.url_uid(item.text);
		process.console.log(item);
		model.mongoose.item.create(item, function (err, data) {
			if (err) {
				process.console.error(err.errmsg);
				return false;
			} else {
				process.console.info('created item');
				process.console.info(data);
			}
		});
	}

});


// //////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////
// // POST SITE
// process.app.post('/site', function(request, response) {
// 	// validate
// 	if (!request.body.site || !request.body.site.url || !request.body.site.items) {
// 		// fail
// 		var error = {
// 			code: 510,
// 			message: '/site POST requires request.body.site == {url:string,items:{}}'
// 		}
// 		process.console.error(error.message);
// 		process.response.json(response, error);
// 		return false;
// 	}
// 	if (!process.fs.existsSync('./public/json/sites')) {
// 		process.fs.mkdirSync('./public/json/sites');
// 	}
	
// 	// filter
// 	var site = request.body.site;
// 	//site.urlEncoded = encodeUri
	
// 	// site
// 	var sid = process.fun.url_uid(request.body.site.url);
// 	process.console.log('post site: ' + encodeURIComponent(request.body.site.url));
// 	var file = process.fs.writeFile(
// 		'./public/json/sites/' + sid + '.json',
// 		JSON.stringify(site),
// 		'utf8',
// 		function(error) {
// 			// response: error
// 			if (error) {
// 				process.response.json(response, {
// 					status: 'error',
// 					message: "Couldn't write file .json"
// 				});
// 				return false;
// 			}
// 			// response: success
// 			process.response.json(response, {});
// 		}
// 	);

// 	// sites
// 	model.contentful.sites[site.url] = site;
// 	var file = process.fs.writeFile(
// 		'./public/json/sites.json',
// 		JSON.stringify(model.contentful.sites),
// 		'utf8',
// 		function(error) {
// 			if (error) {
// 				process.console.error("Couldn't write file ./public/json/sites.json");
// 				return false;
// 			}
// 		}
// 	);
// });


// //////////////////////////////////////////////////////////////////////////////////////////////////
// // GET SITE
// process.app.get('/site', function(request, response) {
// 	// validate
// 	if (!request.query.url || request.query.url.indexOf('http') !== 0) {
// 		// fail
// 		var error = {
// 			code: 511,
// 			message: 'GET /site requires ?url=http://...'
// 		}
// 		process.console.warn(error.message);
// 		process.response.json(response, error);
// 		return false;
// 	}
// 	if (!process.fs.existsSync('./public/json/sites')) {
// 		process.fs.mkdirSync('./public/json/sites');
// 	}
// 	// get
// 	var sid = process.fun.url_uid(request.query.url);
// 	process.console.log('get site: ' + request.query.url);
// 	process.fs.readFile('./public/json/sites/' + sid + '.json', 'utf8', function(error, site) {
// 		if (site) {
// 			// response: success
// 			process.response.json(response, JSON.parse(site));
// 		} else {
// 			// response: error
// 			process.response.json(response, {
// 				status: 'error',
// 				message: "Couldn't find site file .json"
// 			});
// 			return false;
// 		}
// 	});
// });


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
process.app.listen(process.env.PORT, function() {
	process.console.log("Node app is running at localhost: " + process.env.PORT);
});
