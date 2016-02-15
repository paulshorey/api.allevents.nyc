exports.console = {
	log: [],
	warn: [],
	info: [],
	error: [],
	trace: [],
	debug: []
};
exports.consoleLog = function(args, type){
	for (var lg in args) {
		process.view.console[type||'log'].push(args[lg]);
	}
};
exports.consoleShow = function(request, response) {
	response.setHeader('Content-Type', 'text/html');
	response.writeHead(200);
	var log = function( val, name ){
		var rand = process.fun.make_uid();
		response.write('<script>');
		response.write('var '+rand+' = ');
		response.write( process.fun.stringify_once( val ) );
		response.write(';');
		response.write('console.log('+ (name?'"'+name+'",':'') + rand +');');
		response.write('</script>');
	};
	for (var each in process.view.console) {
		for (var lg in process.view.console[each]) {
			log(process.view.console[each][lg]);
		}
	}
	response.end();
};