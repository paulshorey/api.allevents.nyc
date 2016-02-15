////////////////////////////////////////////////////////////////////////////////////////////////////
// PROCESS
var pro = process;
pro.inc = {};
pro.inc.moment = require('moment');
pro.inc.express = require('express');
// modules
pro.request = require('request');
pro.fs = require('fs');
pro.q = require('q');
// env
pro.env.PORT = 8000;
pro.env.PATH = __dirname;
// app
pro.app = pro.inc.express();
pro.contentful = require("./node_custom/contentful.js");
pro.backand = require("./node_custom/backand.js");
pro.fun = require("./node_custom/fun.js");
pro.view = require("./node_custom/view.js");
// secret
pro.secret = require('../../secret/all.js');


////////////////////////////////////////////////////////////////////////////////////////////////////
// LOG
var colors = require('colors');
pro.console = require('tracer').colorConsole({
	filters: {
		trace: colors.white,
		info: colors.green,
		log: colors.blue,
		debug: colors.yellow,
		warn: colors.yellow,
		error: colors.red
	},
	format: [
		"{{message}} \n({{file}}:{{line}})", //default format
		{
			error: "{{message}} \n({{file}}:{{line}})" // error format
		}
	],
	dateformat: "HH:MM:ss.L",
	preprocess: function(data) {
		for (var each in data.args) {
			if (typeof data.args[each] == 'function') {
				(function(callback) {
					data.args[each] = callback.toString();
				})(data.args[each]);
			}
			if (typeof data.args[each] == 'object' || typeof data.args[each] == 'array') {
				data.args[each] = JSON.stringify(data.args[each], null, '\t');
			}
			data.args[each] = data.args[each].replace(/\t/g, ' ');
		}
		pro.console.file.append(data.title, data.args, '[' + data.file + ':' + data.line + ']')
			//data.args.meta = '(' + data.file + ':' + data.line + ')';
		pro.view.consoleLog(data.args, data.title);
	},
	transport: function(data) {
		console.log(data.output);
	}
});
// log automatic
process.on('uncaughtException', function(err) {
	pro.console.error('ERROR: \n' + err.stack);
});
// file setup
pro.console.file = {
	content: '',
	dirpath: pro.env.PATH + '/.logs',
	filepath: pro.env.PATH + '/.logs/.log.html'
};
pro.console.file.append = function(method, args, context) {
	var write = '';
	write += '<script>' + '\n';
	write += 'console.log(' + '\n';

	var ea = 0;
	for (var each in args) {
		if (ea > 0) {
			write += ',';
		}
		var content = args[each];
		if (typeof content == 'object' || content[0] == '{') {
			write += 'JSON.parse(';
		}
		write += content + '\n';
		if (typeof content == 'object' || content[0] == '{') {
			write += ')';
		}
		ea++;
	}

	if (context) {
		write += ',\'' + context + '\'';
	}
	write += ');' + '\n';
	write += '</script>' + '\n\n';
	pro.console.file.content += write;
};
// file write
process.on('exit', (code) => {
	if (!pro.fs.existsSync(pro.console.file.dirpath)) {
		pro.fs.mkdirSync(pro.console.file.dirpath);
	}
	pro.fs.writeFileSync(
		pro.console.file.filepath,
		pro.console.file.content,
		'utf8',
		function(err) {
			console.log('save file?');
			if (err) {
				console.log('appendFile error', err);
			}
			console.log('file was saved');
		});
});


////////////////////////////////////////////////////////////////////////////////////////////////////
// BACKAND
if (1 == 2) {
	pro.backand.auth(pro.secret.backand).then(function() {
		process.backand.get('/1/objects/advertisement?pageSize=1&pageNumber=1&returnObject=true').then(function(data) {
			process.console.info(data);
			process.exit();
		});
		var post = {
			"agency": 5,
			"channel": 2,
			"marketing_campaign": 2
		};
		process.backand.post('/1/objects/advertisement?returnObject=true', post).then(function(data) {
			process.console.log(data);
		});
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// PHANTOM

var driver = require('node-phantom-simple');
//process.console.log("require('phantomjs')", require('phantomjs'));
//process.exit();

driver.create({
	path: require('phantomjs').path
}, function(err, browser) {
	if (err) {
		console.log('err', err);
		return err;
	}
	return browser.createPage(function(err, page) {
		return page.open("http://tilomitra.com/repository/screenscrape/ajax.html", function(err, status) {
			console.log("opened site? ", status);
			page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
				// jQuery Loaded. 
				// Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds. 
				setTimeout(function() {
					return page.evaluate(function() {
						//Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object. 
						var h2Arr = [],
							pArr = [];

						$('h2').each(function() {
							h2Arr.push($(this).html());
						});
						$('p').each(function() {
							pArr.push($(this).html());
						});

						return {
							h2: h2Arr,
							p: pArr
						};
					}, function(err, result) {
						console.log(result);
						browser.exit();
					});
				}, 5000);
			});
		});
	});
});



// var Horseman = require('node-horseman');
// var horseman = new Horseman({
// 	phantomPath: '/usr/local/bin/phantomjs'
// });

// horseman
// 	.userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
// 	.open('http://www.google.com')
// 	.type('input[name="q"]', 'github')
// 	.click("button:contains('Google Search')")
// 	.keyboardEvent("keypress", 16777221)
// 	.waitForSelector("div.g")
// 	.count("div.g")
// 	.log() // prints out the number of results
// 	.close();


////////////////////////////////////////////////////////////////////////////////////////////////////
// END
//process.exit();
