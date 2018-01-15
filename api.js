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
		/* !!!! 
			FIX THIS ASAP :
		!!!! */
		response.setHeader('Access-Control-Allow-Origin', '*'); 
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
// process.console = require("./node_custom/console.js").console;
process.response = require("./node_custom/response.js");
// secret
process.secret = require('../secret-nyc/all.js');
// logging
// var winston = require('winston');
// process.winston = winston.createLogger({
// 	level: 'info',
// 	format: winston.format.json(),
// 	transports: [
// 		//
// 		// - Write to all logs with level `info` and below to `combined.log` 
// 		// - Write all logs error (and below) to `error.log`.
// 		//
// 		new winston.transports.File({ filename: 'public/console/logs/error.json', level: 'error' }),
// 		new winston.transports.File({ filename: 'public/console/logs/index.json' })
// 	]
// });




//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
// For > BOT.ALLEVENTS.NYC > API v1 //
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
// contentful (sites)
process.contentful.myClient = process.contentful.createClient({
  space: process.secret.contentful_delivery.space,
  accessToken: process.secret.contentful_delivery.access_token
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
// BOT.ALLEVENTS.NYC > API v1 //
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
// get sites
process.app.get('/bot.allevents.nyc/v1/all', function(request, response) {
	console.log('get /all');
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
process.app.get('/bot.allevents.nyc/v1/sites', function(request, response) {
	console.log('get /sites');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.sites, error:0},null,"\t"));
	response.end();
});
process.app.get('/bot.allevents.nyc/v1/site', function(request, response) {
	console.log('get /site');
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
process.app.get('/bot.allevents.nyc/v1/categories', function(request, response) {
	console.log('get /categories');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.categories, error:0},null,"\t"));
	response.end();
});
process.app.get('/bot.allevents.nyc/v1/scenes', function(request, response) {
	console.log('get /categories');
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(JSON.stringify({data:view.scenes, error:0},null,"\t"));
	response.end();
});
process.app.get('/bot.allevents.nyc/v1/time*', function(request, response) {
	var when = (request.params[0] ? request.params[0].substr(1) : '');
	response.setHeader('Content-Type', 'application/json'); 
	response.writeHead(200);
	response.write(JSON.stringify({data: process.timestamp[when||'now'](), error:0},null,"\t"));
	response.end();
});
//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// count events
process.app.all('/bot.allevents.nyc/v1/count', function(request, response) {
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
process.app.all('/bot.allevents.nyc/v1/remove', function(request, response) {
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
process.app.all('/bot.allevents.nyc/v1/events*', function(request, response) {
	var meta = {};
	meta.referrer = process.url.parse(request.headers.referer||'', true, true).hostname;
	var request_query = Object.keys(request.body).length ? request.body : request.query;
	var query = {};
	process.console.warn('/events '+request.method+' from '+meta.referrer+' '+JSON.stringify(request_query));
	var query_limit = 1000;
	var query_skip = 0;
	// first special keys
	if (request_query.text) {
		query.$text = {$search:request_query.text};
		delete request_query.text;
	}
	if (request_query.limit) {
		query_limit = request_query.limit;
		delete request_query.limit;
	}
	if (request_query.skip) {
		query_skip = request_query.skip;
		delete request_query.skip;
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
	console.log('get /events  '+JSON.stringify(query));
	model.mongoose.item
	.find(query)
	.limit(query_limit)
	.skip(query_skip)
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
process.app.post('/bot.allevents.nyc/v1/items', function(request, response) {
	console.log('post /items');
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
// // EXTRAS
process.app.all('/bot.allevents.nyc/v1/json', function(request, response) {
	var meta = {};
	meta.referrer = process.url.parse(request.headers.referer||'', true, true).hostname;
	var request_query = Object.keys(request.body).length ? request.body : request.query;
	var query = {};
	process.console.warn('/json '+request.method+' from '+meta.referrer+' '+JSON.stringify(request_query));
	if (request_query.file) {
		var json = process.fs.readFileSync('public/json/'+request_query.file+'.json', 'utf8');

		response.writeHead(200);
		response.write(json);
		response.end();
	} else {
		return process.console.warn('file not found');
	}
});





//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
// APIFY
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
// API > Get Crawler
process.app.get('/apify/v1/crawlerGet', function(rq, rs) {
	console.log('get /apify/v1/crawlerGet', JSON.stringify(rq.body,null,"	"));

	/*
		1) get crawler
	*/
	var options = {
		uri: "https://api.apify.com/v1/"+process.secret.apify.user+"/crawlers/"+rq.body.crawler._id+"?token="+process.secret.apify.token+"",
		method: 'GET'
	};
	process.request(options, function (error, response, body) {
		var output = {};
		output.status = response.statusCode;
		output.body = error||body;
		if (!error && Math.round(response.statusCode/100) === 2) {
		
			rs.writeHead(200);
			rs.write(JSON.stringify(output,null,"	"));
			rs.end();
		
		} else {
					
			rs.writeHead(500);
			rs.write(JSON.stringify(output,null,"	"));
			rs.end();

		}
	});	

});
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
// API > Update Crawler > and immediately run it to get the results URL
process.app.post('/apify/v1/crawlerUpdateExecute', function(rq, rs) {
	console.log('post /apify/v1/crawlerUpdateExecute', JSON.stringify(rq.body,null,"	"));

	/*
		1) update crawler
	*/
	var options = {
		uri: "https://api.apify.com/v1/"+process.secret.apify.user+"/crawlers/"+rq.body.crawler._id+"?token="+process.secret.apify.token+"",
		method: 'PUT',
		json: rq.body.crawler
	};
	process.request(options, function (error, response, body) {
		var output = {};
		output.status = response.statusCode;
		output.body = error||body;
		if (!error && Math.round(response.statusCode/100) === 2) {
			
			/*
				2) execute crawler
			*/
			var options = {
				uri: response.body.executeUrl,
				method: 'GET'
			};
			process.request(options, function (error, response, body) {
				var output = {};
				output.status = response.statusCode;
				output.body = JSON.parse(error||body);
				if (!error && Math.round(response.statusCode/100) === 2) {
			
					rs.writeHead(200);
					rs.write(JSON.stringify(output,null,"	"));
					rs.end();
					
				} else {
					
					rs.writeHead(500);
					rs.write(JSON.stringify(output,null,"	"));
					rs.end();

				}
			});
		}

	});

});




////////////////////////////////////////////////////////////////////////////////////////////////////
// start
var httpServer = process.http.createServer(process.app);
httpServer.listen(1080);
var httpsServer = process.https.createServer({key: process.fs.readFileSync('/etc/letsencrypt/live/api.allevents.nyc/privkey.pem', 'utf8'), cert: process.fs.readFileSync('/etc/letsencrypt/live/api.allevents.nyc/fullchain.pem', 'utf8')}, process.app);
httpsServer.listen(1443);
// end
process.stdin.resume();//so the program will not close instantly
function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}
process.on('exit', exitHandler.bind(null,{cleanup:true}));//do something when app is closing
process.on('SIGINT', exitHandler.bind(null, {exit:true}));//catches ctrl+c event
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));//catches uncaught exceptions