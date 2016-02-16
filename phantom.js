////////////////////////////////////////////////////////////////////////////////////////////////////
// PRO
// var pro = process;
// pro.inc = {};
// pro.inc.moment = require('moment');
// pro.inc.express = require('express');
// // modules
// pro.request = require('request');
// pro.fs = require('fs');
// pro.q = require('q');
// // env
// pro.env.PORT = 8000;
// // app
// pro.app = pro.inc.express();
// pro.contentful = require("./node_custom/contentful.js");
// pro.backand = require("./node_custom/backand.js");
// pro.fun = require("./node_custom/fun.js");
// pro.view = require("./node_custom/view.js");
// // secret
// pro.secret = require("../secret/all.js");

////////////////////////////////////////////////////////////////////////////////////////////////////
// LOG
// var colors = require('colors');
// pro.console = require('tracer').colorConsole({
// 	filters: {
// 		trace: colors.white,
// 		info: colors.green,
// 		log: colors.blue,
// 		debug: colors.yellow,
// 		warn: colors.orange,
// 		error: colors.red
// 	},
// 	format: [
// 		"{{message}} \n({{file}}:{{line}})", //default format
// 		{
// 			error: "{{message}} \n({{file}}:{{line}})" // error format
// 		}
// 	],
// 	dateformat: "HH:MM:ss.L",
// 	preprocess: function(data) {
// 		data.args.meta = '(' + data.file + ':' + data.line + ')';
// 		pro.view.consoleLog(data.args, data.title);
// 	},
// 	transport: function(data) {
// 		console.log(data.output);
// 		// var stream = pro.fs.createWriteStream("./logs/.log", {
// 		//     flags: "a",
// 		//     encoding: "utf8",
// 		//     mode: 0666
// 		// }).write(data.output+"\n");
// 		pro.fs.appendFile('logs/.' + data.title, pro.fun.stringify_once(data.args) + '\n', function(err) {
// 			if (err) {
// 				console.log('appendFile error', err);
// 			}
// 		});
// 	}
// });
// // fatal
// //pro.console.log.fatal = pro.fs.createWriteStream('./logs/.fatal',{flags:'a'});  
// process.on('uncaughtException', function(err) {
// 	pro.console.error('FATAL ERROR: \n' + err.stack);
// 	//pro.log.fatal.write('\n' + err.stack + '\n');
// });
// // view
// pro.app.all('*', pro.view.consoleShow);
// pro.app.listen(process.env.PORT, function() {
// 	//pro.console.log("Node app is running at port " + process.env.PORT);
// });

////////////////////////////////////////////////////////////////////////////////////////////////////
// BACKAND
// pro.backand.auth(pro.secret.backand).then(function(){
// 	process.backand.get('/1/objects/advertisement?pageSize=1&pageNumber=1&returnObject=true').then(function(data){
// 		process.console.log('Data: ',data);
// 	});
// 	var post = {
// 		"agency": 5,
// 		"channel": 2,
// 		"marketing_campaign": 2
// 	};
// 	process.backand.post('/1/objects/advertisement?returnObject=true', post).then(function(data){
// 		process.console.log('POSTED: ',data);
// 	});
// });

////////////////////////////////////////////////////////////////////////////////////////////////////
// PHANTOM
var phantom = require('phantomjs-prebuilt');
var webpage = require('webpage');
var page = webpage.create();

page.open("http://admin.artspaces.net/", function(status) {
	//console.log("opened page?", status);
	page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
		page.evaluate(function() {

			console.log('jquery loaded ?');

			//var $loginForm = $('form');
			//$loginForm.find('input[type="text"]').val('phantomjs');
			//$loginForm.find('input[type="password"]').val('c45p3r');

			console.log('jquery loaded');
			//phantom.exit();

		});
	});

	// page.evaluate(function () { 
	// 	return $('body'); 
	// }, function (result) {
	//   console.log('Page title is ' + result);
	//   ph.exit();
	// });
});