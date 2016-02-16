exports.url_uid = function(str) {
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
	return str + hash;
};

exports.make_uid = function(length) {
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

exports.stringify_once = function(obj, replacer, indent) {
	var printedObjects = [];
	var printedObjectKeys = [];

	function printOnceReplacer(key, value) {
		if (printedObjects.length > 2000) { // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
			return 'object too long';
		}
		var printedObjIndex = false;
		printedObjects.forEach(function(obj, index) {
			if (obj === value) {
				printedObjIndex = index;
			}
		});

		if (key === '') { //root element
			printedObjects.push(obj);
			printedObjectKeys.push("root");
			return value;
		} else if (printedObjIndex + "" != "false" && typeof(value) == "object") {
			if (printedObjectKeys[printedObjIndex] == "root") {
				return "(pointer to root)";
			} else {
				return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase() : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
			}
		} else {

			var qualifiedKey = key || "(empty key)";
			printedObjects.push(value);
			printedObjectKeys.push(qualifiedKey);
			if (replacer) {
				return replacer(key, value);
			} else {
				return value;
			}
		}
	}
	var stringified = JSON.stringify(obj, printOnceReplacer, indent);
	return stringified;
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
