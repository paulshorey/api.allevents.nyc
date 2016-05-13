var pro = process;
// modules
process.request = require('request');
process.fs = require('fs');
// env
process.env.PORT = 9909;
process.env.PATH = __dirname;
// custom
process.fun = require("./node_custom/fun.js");
process.console = require("./node_custom/console.js").console; // uses process.app
process.response = require("./node_custom/response.js");
// secret
process.secret = require('../secret-nyc/all.js');
// mongoose
process.mongoose = require('mongoose');
process.mongoose.connect('mongodb://localhost/api');

// model
var model = {};
model.mongoose = {};
model.mongoose.schemas = {};
model.mongoose.schemas.item = { 
	_id: String,
	text: { type:String, required: true },
	timestamp: { type:Number, required: true },
	image: String,
	link: String,
	category: { type:String, default: '' },
	scene: { type:String, default: '' },
	venue: String,
	date: String,
	time: String,
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

// delete
model.mongoose.item.find({timestamp:{$lt:Date.now()}}, function (err, data) {
	if (err) {
		process.console.error(err);
	}
	for (var each in data) {
		process.console.info(data[each]);
		data[each].remove();
	}
	process.exit();
});