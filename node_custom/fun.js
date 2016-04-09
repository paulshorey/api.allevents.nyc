exports.str_uid = function(str) {
	// simple
	str = str.replace(/[^A-Za-z0-9]/g, '');
	// unique
	var hash = 0;
	if (str.length == 0) {
		return hash;
	}
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	// ok
	return str.substr(0,20) + hash;
};

exports.random_uid = function(length) {
	length = parseInt(length);
	if (!length) {
		length = 11;
	}
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz";
	text += possible.charAt(Math.floor(Math.random() * possible.length));
	possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (i = 1; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

exports.to_query_string = function(obj) {
	var parts = [];
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
		}
	}
	return parts.join("&");
};

exports.addslashes = function(str) {
	// str = str.replace(/\\/g, '\\\\');
	// str = str.replace(/\'/g, '\\\'');
	// str = str.replace(/\"/g, '\\"');
	// str = str.replace(/\0/g, '\\0');
	return str;
};

exports.stripslashes = function(str) {
	// str = str.replace(/\\'/g, '\'');
	// str = str.replace(/\\"/g, '"');
	// str = str.replace(/\\0/g, '\0');
	// str = str.replace(/\\\\/g, '\\');
	return str;
};
