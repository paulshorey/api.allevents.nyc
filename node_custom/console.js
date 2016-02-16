var colors = require('colors');

// console
exports.console = require('tracer').colorConsole({
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
			data.args[each] = process.fun.stringify_once(data.args[each],null,'');
			if (data.args[each]) {
				data.args[each] = data.args[each].replace(/(?:\r\n|\r|\n)/g, '\t').replace(/\t/g, ' ');
			}
		}
		process.console.file.append(data.title, data.args, '[' + data.file + ':' + data.line + ']')
			//process.view.consoleLog(data.args, data.title);
	},
	transport: function(data) {
		console.log(data.output);
	}
});


exports.console.file = {
	content: '',
	filedir: '.',
	append: function(method, args, context) {
		var write = '';
		write += '<script>' + '\n';
		write += 'console.log(';
		var ea = 0;
		for (var each in args) {
			if (!args[each]) {
				continue;
			}
			if (ea > 0) {
				write += ',';
			}
			var content = args[each];
			// if (typeof content == 'string' && content.indexOf('{')!=-1 && content.indexOf('":')!=-1 ) {
			//     write += 'JSON.parse(';
			// }
			write += content;
			// if (typeof content == 'string' && content.indexOf('{')!=-1 && content.indexOf('":')!=-1 ) {
			//     write += ')';
			// }
			ea++;
		}
		if (context) {
			write += ',\'' + context + '\'';
		}
		write += ');' + '\n';
		write += '</script>' + '\n\n';
		process.console.file.content += write;
	}
};

// error handling
process.on('uncaughtException', function(err) {
	process.console.error('uncaughtException: \n' + err.stack);
});
process.on('exit', function(code) {
	process.fs.writeFileSync(
		process.console.file.filedir + '/.html',
		process.console.file.content,
		'utf8',
		function(err) {
			if (err) {
				process.console.warn('on exit, writeFileSync error: \n' + err.stack);
			}
		});
});

// view
if (process.app && process.app.get) {
	process.app.get('/log', function(request, response) {
		process.console.warn('log');
		response.setHeader('Content-Type', 'text/html');
		response.writeHead(200);
		response.write(process.console.file.content);
		response.end();
	});
}
