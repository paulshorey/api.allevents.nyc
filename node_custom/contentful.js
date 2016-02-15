// GET
exports.access_token = '9dc696f94e6d42ec9df494d05f5503a9d661113ac9a276d4e847654d736dcb11'; // process.secret.contentful.access_token
exports.space = '9zluqvrasasu';
exports.types = {};
exports.types.homepage = '4llYLIQtH2UguewwuiQYyc';
exports.types.subnav = '6ZLfgXkj8QWmqaaYkkEUW8';
exports.types.promostrip = '3oIaQTFa6kIQGCq6mW44ui';
exports.types.film = 'CxIkCWvkhEOgIco4e4OSC';
exports.types.article = '3x2pkS3sPmeMQkekmuyEA4';
exports.types.video = '2pc1fnP4lSECcOwa4miK4E';

exports.entries = function( type, callback ) {

	var url = 'https://cdn.contentful.com/spaces/'+this.space+'/entries?content_type='+this.types[type]+'&access_token='+this.access_token+'';
	
	process.inc.request( url , function (error, response, body) {
	
		var insert_assets = function(){
			// todo!
		};
		
		body = JSON.parse(body);
		var output = {};

		// request success 
		if (!error && response.statusCode == 200) {
			
			// ANYTHING
			if (!body.items) {
				console.error('contentful.js NO CONTENT at url "'+url+'"');
				return false;
			} else {
				console.log('contentful.js successful request to url "'+url+'"');
		  		// debug:
		  		output.body = body;
		}

		// ASSETS
		output.assets = {};
		if (body.includes) {
			for (var ba in body.includes.Asset) {
				var fa = body.includes.Asset[ ba ].sys.id;
				output.assets[ fa ] = body.includes.Asset[ ba ].fields;
				output.assets[ fa ].id = body.includes.Asset[ ba ].sys.id;
			}
			for (var ba in body.includes.Entry) {
				var fa = body.includes.Entry[ ba ].sys.id;
				output.assets[ fa ] = body.includes.Entry[ ba ].fields;
				output.assets[ fa ].id = body.includes.Entry[ ba ].sys.id;
			}
		}
			
		// ITEMS
		output.items = {};
		if (body.items) {
		  	// each body row
		  	for (var brow in body.items) {
		  		if (body.items[ brow ].sys) {
		  			
		  			// each film row
		  			var frow = body.items[ brow ].sys.id;
		  			if (body.items[ brow ].fields.url) {
		  				frow = body.items[ brow ].fields.url;
		  			}
			  		output.items[ frow ] = body.items[ brow ].fields;
			  		output.items[ frow ].id = body.items[ brow ].sys.id;
			  		
			  		// each field
		  			for (var field in body.items[ brow ].fields) {
		  				if (typeof body.items[ brow ].fields[ field ] == 'object') {
		  					
		  					// null 
		  					if (body.items[ brow ].fields[ field ] === null) {
			
		  					// object
		  					} else if (body.items[ brow ].fields[ field ].sys) {
		  						var asset = body.items[ brow ].fields[ field ].sys.id;
		  						
		  						// include asset
		  						if (output.assets[ asset ]) {
			  						output.items[ frow ][ field ] = output.assets[ asset ];
			  						
	  						
			  						/*
			  							output.items[ frow ][ field ] = insert_assets( output.items[ frow ][ field ] );
			  						*/
			  						// INCLUDE ASSET
			  						// 
			  						// if entry
			  						if (typeof output.items[ frow ][ field ] == 'object') {
				  						for (var entry in output.items[ frow ][ field ]) {
						  					
						  					// if entry is object
						  					if (body.items[ brow ].fields[ field ][ entry ].sys) {
						  						var asset = body.items[ brow ].fields[ field ][ entry ].sys.id;
				  								// include asset
						  						if (output.assets[ asset ]) {
						  							output.items[ frow ][ field ][ entry ] = output.assets[ asset ];
						  							output.items[ frow ][ field ][ entry ].id = asset;
						  						}
						  						
						  					}
						  				}
						  			}
						  			//
						  			// END ASSET
						  			
					  				
					  			}
					  			
		  					
		  					// list of objects
			  				} else {
				  				for (var entry in body.items[ brow ].fields[ field ]) {
				  					
				  					// if object
					  				// ex: film->items[0]->posterImages[0]
				  					if (body.items[ brow ].fields[ field ][ entry ].sys) {
				  						var asset = body.items[ brow ].fields[ field ][ entry ].sys.id;

					  						/*
					  							output.items[ frow ][ field ] = insert_assets( output.items[ frow ][ field ] );
					  						*/
					  						// INCLUDE ASSET
					  						// 
					  						// if entry
					  						// ex: page->promoImage->file
					  						if (typeof output.items[ frow ][ field ] == 'object') {
						  						for (var entry in output.items[ frow ][ field ]) {
								  					
								  					// if entry is object
								  					if (body.items[ brow ].fields[ field ][ entry ].sys) {
								  						var asset = body.items[ brow ].fields[ field ][ entry ].sys.id;
						  								
						  								// include asset
								  						if (output.assets[ asset ]) {
								  							output.items[ frow ][ field ][ entry ] = output.assets[ asset ];
								  							output.items[ frow ][ field ][ entry ].id = asset;
						  									
						  									
									  						// INCLUDE ASSET
									  						// 
									  						// if entry
					  										// ex: page->billboardImage->promoImage->file
									  						if (typeof output.items[ frow ][ field ][ entry ] == 'object') {
										  						for (var each in output.items[ frow ][ field ][ entry ]) {
												  					
												  					// if entry is object
												  					if (body.items[ brow ].fields[ field ][ entry ][ each ].sys) {
												  						var asset = body.items[ brow ].fields[ field ][ entry ][ each ].sys.id;
												  						
										  								// include asset
												  						if (output.assets[ asset ]) {
												  							output.items[ frow ][ field ][ entry ][ each ] = output.assets[ asset ];
												  							output.items[ frow ][ field ][ entry ][ each ].id = asset;
				  															
				  															
													  						// INCLUDE ASSET
													  						// 
				  															// output.items[ frow ][ field ][ entry ][ each ];
																  			//
																			// END ASSET
																			
																			
												  						}
												  					}
												  				}
												  			}
												  			//
															// END ASSET
															
											  				
								  						}
								  					}
								  				}
								  			}
								  			//
											// END ASSET
											
				  						
				  					}
				  				}
				  			}
			  				//
			  				
		  				} else {
		  				}
				  	}
				  	//
				  	
			  	}
		  	}
		  }
		  
		// request error	
		} else {
			
			// OUTPUT
			console.error('contentful.js REQUEST FAILED to url "'+url+'"');
			
		}

		// return
		delete output.body;
		callback(output);

	});

};