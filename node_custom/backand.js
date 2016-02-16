/*
	DEPENDENCIES:
	process.request = require('request');
	process.q = require('q');

	USE:
	process.backand = require("./node_custom/backand.js");
	process.backand.auth({ username:'a@b.c', password:'etc', appname:'test' })
		.then(function(){
			process.backand.get('/1/objects/advertisement?pageSize=1&pageNumber=1').then(function(data){
				console.log('Data: ',data);
			});
		});
*/

exports.auth = function(settings){
	var backand = this;
	var deferred = process.q.defer();
	backand.settings = {};
	process.request(
		{
			url: 'https://api.backand.com/token',
			method: "POST",
			form: {
				username: settings.username,
				password: settings.password,
				appname: settings.appname,
				grant_type: 'password'
			}
		},
		function(error, response, data) {
			data = backand.handleResponse(deferred, error, response, data);
			if (!data) {
				return false;
			}
			backand.settings.access_token = data.access_token;
		}
	);
	return deferred.promise;
};

exports.get = function(uri){
	var backand = this;
	var deferred = process.q.defer();
	var post = {
		auth: {
			'bearer': backand.settings.access_token
		}
	};
	process.request.get('https://api.backand.com'+uri, post, function(error, response, data) {
		data = backand.handleResponse(deferred, error, response, data)
		if (!data) {
			return false;
		}
	});
	return deferred.promise;
};

exports.post = function(uri, post){
	var backand = this;
	var deferred = process.q.defer();
	process.request(
		{
			method: 'POST',
			url: 'https://api.backand.com'+uri, 
			data: post,
			headers: {
				'Authorization': 'Bearer '+backand.settings.access_token,
			}
		},
		function(error, response, data) {
			data = backand.handleResponse(deferred, error, response, data)
			if (!data) {
				return false;
			}
		}
	);
	return deferred.promise;
};

exports.handleResponse = function(deferred, error, response, data){
	if (error) {
		console.error('Error: ', error);
		deferred.reject(error);
		return false;
	}
	if (response.statusCode != 200) {
	      error = 'Status code: "'+response.statusCode+'"';
		console.error('Error: ', error);
		deferred.reject(error);
		return false;
	}
	if (data) {
		data = JSON.parse(data);
		deferred.resolve(data);
		return data;
	}
};