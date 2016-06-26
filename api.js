/*
	GUIDELINES:
	response .data is always array of objects, even if only one item requested or queried
	post request consists of one or more objects, named corresponding to the object type they are modifying
	get request consists of one or more strings, referencing the url or id of the aptly named object type
*/

var pro = process;
process.inc = {};
process.inc.express = require('express');
process.inc.express_parser = require('body-parser');
// modules
process.moment = require('moment-timezone'); // process.moment(new Date(2011, 9, 16)).
process.moment.now = process.moment();
process.request = require('request');
process.fs = require('fs');
process.http = require('http');
process.https = require('https');
process.q = require('q');
process.contentful = require('contentful');
process.url = require('url');
// process.cors = require('cors');
//process.mkdirp = require('mkdirp');
// env
process.env.PORT = 1080;
process.env.PATH = __dirname;
// app
process.app = process.inc.express();
	process.app.use(process.inc.express_parser.json({
		limit: '50mb',
		parameterLimit: 10000,
		extended: true
	}));
	process.app.use(process.inc.express_parser.urlencoded({
		limit: '50mb',
		parameterLimit: 10000,
		extended: true
	}));
	process.app.use(process.inc.express.static('public'));
	process.app.disable('trust proxy');
	process.app.use(function(request, response, next){
		var referrer = process.url.parse(request.headers.referer||'', true, true).hostname;
		response.setHeader('Access-Control-Allow-Origin', '*'); // header contains the invalid value 'app.allevents.nyc'. Origin 'http://app.allevents.nyc' is therefore not allowed access <-- don't know if browser will include http:// or not
		response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma, Authorization, Content-Length, X-Requested-With, X-Host');
		if ('OPTIONS' == request.method) {
			response.writeHead(200);
			response.end();
			return;
		} else {
			next();
			return;
		}
	});
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
	view[items] = [];
	process.contentful.myClient.entries({ content_type: item, order: '-fields.likes' })
	.then(function(items_new) {
		items_new = model.contentful.myEntries(items_new, undefined, item); // from contentful
		if (items_new) {
			for (var key in items_new) {
				// save
				view[items].push(items_new[key]);
				var i = view[items].length-1;
				// tweak
				if (item=='site') {
					view[items][i].host = view[items][i].url.match(/(^https?:\/\/[a-zA-Z0-9.-]*)/)[1];
					view[items][i].link = view[items][i].url.replace(/{{([^}]*)}}/g, function(match, string) {
						var now = Date.now();
						var plus = string.split('+');
						string = plus[0];
						if (plus[1]) {
							now += parseInt(plus[1]);
						}
						return process.moment(now).format(string);
					});
				}
			}
		}
		// done
		process.console.info(''+(items_new.length||0)+' '+items);
	});
};

// mongoose
model.mongoose = {};
model.mongoose.schemas = {};
model.mongoose.schemas.item = { 
	_id: String,
	texts: { type:Object, required: true },
	timestamp: { type:Number, required: true },
	image: String,
	link: String,
	category: { type:String, default: '' },
	scene: { type:String, default: '' },
	venue: String,
	date: String,
	time: String,
	featured: { type:String, default: '' },
	price: { type:String, default: '' },
	timeAdded: { type:Number, default: Date.now() },
	likes: { type:Number, default: 0 },
	random: { type:Number, default: 0 },
	source: String,
	source_host: { type:String, required: true },
	source_link: { type:String, required: true },
	source_title: { type:String, required: true },
	site: Array

};
model.mongoose.item = process.mongoose.model('Item', model.mongoose.schemas.item);

// time
process.timestamp = new function() {
	var timestamp = function(){ 
		var timezone = 'America/New_York';
		var moment = process.moment(new Date()).tz(timezone);
		var DD = moment.format('DD');
		var MM = moment.format('MM');
		var YYYY = moment.format('YYYY');
		return Date.parse( new Date( YYYY, MM-1, DD ) ); 
	};
	this.now = function(){ return Date.now(); };
	this.today_start = function(){ return timestamp() +0; };
	this.today_end = function(){ return timestamp() +1*(24*60*60*1000) -1; };
	this.tomorrow_start = function(){ return timestamp() +1*(24*60*60*1000); };
	this.tomorrow_end = function(){ return timestamp() +2*(24*60*60*1000) -1; };
	this.thisweek_start = function(){ return timestamp() +1*(24*60*60*1000) -1; };
	this.thisweek_end = function(){ return timestamp() +7*(24*60*60*1000) -1; };
	this.thismonth_end = function(){ return timestamp() +31*(24*60*60*1000) -1; };
}();
console.warn('timestamp.tomorrow_start()',process.timestamp.tomorrow_start());


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// VIEW
var view = {};
model.contentful.getContent('site','sites');
model.contentful.getContent('category','categories');
model.contentful.getContent('scene','scenes');

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// HOOK
process.app.all('/_contentful', function(request, response) {
	process.console.warn('hook /_contentful');
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
//////////////////////////////////////////////////////////////////////////////////////////////////////
// THE API //
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// get sites
process.app.get('/all', function(request, response) {
	process.console.log('get /sites');
	var all = {};
		all.sites = view.sites || [];
		all.categories = view.categories || [];
		all.scenes = view.scenes || [];
		model.mongoose.item.find({}).count().exec().then(function (count) {
			all.eventsCount = count;
			response.setHeader('Content-Type', 'application/json');
			response.writeHead(200);
			response.write(JSON.stringify({data:all, error:0},null,"\t"));
			response.end();
		});
});
process.app.get('/sites', function(request, response) {
	process.console.log('get /sites');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.sites, error:0},null,"\t"));
	response.end();
});

	process.app.get('/site', function(request, response) {
		process.console.log('get /site');
		var site = {time_attempted:Date.now()};
		for (var si in view.sites) {
			// if never attempted, take first
			if (!view.sites[si].time_attempted) {
				site = view.sites[si];
				break;
			// if attempted, keep going to find oldest
			} else if (view.sites[si].time_attempted < site.time_attempted) {
				site = view.sites[si];
			}
		}
		// if attempted in less than 4 hours
		if (site.time_attempted > Date.now()-(1000*60*60*4)) {
			response.setHeader('Content-Type', 'application/json');
			response.writeHead(500);
			response.write(JSON.stringify({data:null,error:'Recently crawled each site... wait a while to bother them again'},null,"\t"));
			response.end();
			return;
		}
		// data
		site.time_attempted = Date.now();
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(JSON.stringify({data:[site], error:0},null,"\t"));
		response.end();
	});
process.app.get('/categories', function(request, response) {
	process.console.log('get /categories');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.categories, error:0},null,"\t"));
	response.end();
});
process.app.get('/scenes', function(request, response) {
	process.console.log('get /categories');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.scenes, error:0},null,"\t"));
	response.end();
});

process.app.get('/time*', function(request, response) {
	var when = (request.params[0] ? request.params[0].substr(1) : '');
	response.setHeader('Content-Type', 'application/json'); 
	response.writeHead(200);
	response.write(JSON.stringify({data: process.timestamp[when||'now'](), error:0},null,"\t"));
	response.end();
});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// count events
process.app.all('/count', function(request, response) {
	process.console.info('/count');
	model.mongoose.item
	.count({})
	.exec(function(err, items){
		if (err) {
			return process.console.warn(err);
		} else {
			response.setHeader('Content-Type', 'application/json'); 
			response.writeHead(200);
			response.write(JSON.stringify({count:items, error:0},null,"\t"));
			response.end();
		}
	});
});
// remove events
process.app.all('/remove', function(request, response) {
	process.console.warn('/remove');
	model.mongoose.item
	.remove({})
	.exec(function(err, items){
		if (err) {
			return process.console.warn(err);
		} else {
			response.setHeader('Content-Type', 'application/json'); 
			response.writeHead(200);
			response.write(JSON.stringify({deleted:items, error:0},null,"\t"));
			response.end();
		}
	});
});
// get events
process.app.all('/events*', function(request, response) {
	var meta = {};
	meta.referrer = process.url.parse(request.headers.referer||'', true, true).hostname;
	var request_query = Object.keys(request.body).length ? request.body : request.query;
	var query = {};
	process.console.warn('/events '+request.method+' from '+meta.referrer+' '+JSON.stringify(request_query));

	// first special keys
	if (request_query.text) {
		query.$text = {$search:request_query.text};
		delete request_query.text;
	}

	// then automatic keys
	for (var qk in request_query) {
		if (qk=='category' || qk=='scene'){
			request_query[qk] = process.fun.capitalize(request_query[qk]);

			// multiple terms // dont work, can't store finished RegExp object as a variable, it gets output as empty object
			// query[qk] = {$in:[]};
			// var split = request_query[qk].split(',').map(function(e){return e.trim();});
			// for (var sk in split) {
			// 	query[qk].$in.push( new RegExp(split[sk],'i') );
			// }

			// for now just do one
			query[qk] = new RegExp(request_query[qk].replace('+','\\+'),'');

		}
	}

	// required & default keys
	query['timestamp'] = {$gt: (process.timestamp.today_start() - 1) };
	if (request_query['time']=='today') {
		query['timestamp'] = {$gt:process.timestamp.today_start()-1,$lt:process.timestamp.today_end()};
	}
	else if (request_query['time']=='tomorrow') {
		query['timestamp'] = {$gt:process.timestamp.tomorrow_start()-1,$lt:process.timestamp.tomorrow_end()};
	}
	else if (request_query['time']=='this week') {
		query['timestamp'] = {$gt:process.timestamp.today_start()-1,$lt:process.timestamp.thisweek_end()};
	}
	else if (request_query['time']=='this month') {
		query['timestamp'] = {$gt:process.timestamp.today_start()-1,$lt:process.timestamp.thismonth_end()};
	}

	// ok go
	process.console.log('get /events  '+JSON.stringify(query));
	model.mongoose.item
	.find(query)
	.sort({timestamp:1})
	.exec(function(err, items){
		if (err) {
			return process.console.warn(err);
		} else {
			meta.count = items.length;
			response.setHeader('Content-Type', 'application/json'); 
			response.writeHead(200);
			response.write(JSON.stringify({meta:meta, data:items, error:0},null,"\t"));
			response.end();
		}
	});

});


//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// post items
process.app.post('/items', function(request, response) {
	process.console.log('post /items');
	
	for (var it = 0; it < request.body.items.length; it++) {
		var item = request.body.items[it];
		if (item.timestamp < Date.now()) {
			continue;
		}
		var query = {};
		if (!item.texts || !item.texts[0]) {
			continue;
		} else {
			process.console.info(item.texts[0]);
		}
		query._id = item.timestamp+process.fun.hash_str(item.texts.join());
		delete item.site;
		model.mongoose.item.update(query, item, {upsert:true}, function (err, data) {
			if (err) {
				process.console.error(err);
				return false;
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
// 	var sid = process.fun.str_uid(request.body.site.url);
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
// 	var sid = process.fun.str_uid(request.query.url);
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
// start
var httpServer = process.http.createServer(process.app);
httpServer.listen(process.env.PORT);

var httpsServer = process.https.createServer({key: process.fs.readFileSync('/etc/letsencrypt/live/api.allevents.nyc/privkey.pem', 'utf8'), cert: process.fs.readFileSync('/etc/letsencrypt/live/api.allevents.nyc/fullchain.pem', 'utf8')}, process.app);
httpsServer.listen(443);