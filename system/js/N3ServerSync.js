var N3ServerSync = (function() {

//	var _httpGet = function (uri, mimeType, callback) {
//	    try { var request = new XMLHttpRequest(); }
//	    catch(error) { var request = null; }
//	    if (request == null)
//	      return callback("Invalid Request");
//	    request.onreadystatechange = function() {
//	    	if (request.readyState === 4) {
//		    	if (request.status == 200 || request.status == 201 || request.status == 204) {
//			    	if (callback)
//			    		return callback(null,request.responseText,request.responseXML);
//			    	return;
//		    	}
//				if (request.status == 400)
//					return callback("Parse error");
//				if (request.status == 500)
//					return callback("Server error"); 
//				if (request.status == 503)
//					return callback("Service not available");
//				return callback("Unknown HTTP response code: " + request.status);
//			}
//	    };
//
//        request.open("GET",	uri);
//        request.setRequestHeader("Accept",mimeType);
//        request.send();
//
//	}

//	var _httpGetStreaming = function(uri, process, mimeType, callback) {
//		var xhr = new XMLHttpRequest();
//		xhr.open('GET', uri);
//		if (mimeType)
//	        xhr.setRequestHeader("Accept",mimeType);
//
//		xhr.seenBytes = 0;
//		xhr.onreadystatechange = function() { 1
//			if(xhr.readyState > 2) {
//		    	if (request.status == 200 || request.status == 201 || request.status == 204) {
//				    var newData = xhr.responseText.substr(xhr.seenBytes);
//				    if (process)
//				    	process(newData);
//				    xhr.seenBytes = xhr.responseText.length;
//			    	if (xhr.readyState == 4 && callback)
//			    		return callback();
//			    	return;
//		    	}
//				if (request.status == 400)
//					return callback("Parse error");
//				if (request.status == 500)
//					return callback("Server error"); 
//				if (request.status == 503)
//					return callback("Service not available");
//				return callback("Unknown HTTP response code: " + request.status);
//		  }
//		};
//
//		xhr.send();
//		
//	}
	
//	var _httpPost = function (uri, mimeType, slug, content, callback) {
//	    try { var request = new XMLHttpRequest(); }
//	    catch(error) { var request = null; }
//	    if (request == null)
//	      return callback("Invalid Request");
//	    request.onreadystatechange = function() {
//	    	if (request.readyState === 4) {
//		    	if (request.status == 200 || request.status == 201 || request.status == 204) {
//			    	if (callback)
//			    		return callback();
//			    	return;
//		    	}
//				if (request.status == 400)
//					return callback("Parse error");
//				if (request.status == 500)
//					return callback("Server error"); 
//				if (request.status == 503)
//					return callback("Service not available");
//				return callback("Unknown HTTP response code: " + request.status);
//			}
//		};
//	    
//	    request.open("POST", uri);
//	    if (mimeType)
//	    	request.setRequestHeader("Content-Type",mimeType);
//	    if (slug)
//	    	request.setRequestHeader("Slug",slug);
//	    request.send(content);
//	    
//	};
		
	var _httpRequest = function (uri, method, inMimeType, outMimeType, inContent, process, callback) {
		var xhr = null;
	    try { xhr = new XMLHttpRequest(); }
	    catch(error) { return callback("Invalid Request: " + error); }
	    if (xhr == null)
	    	return callback("Invalid Request");
	    
		xhr.seenBytes = 0;
		xhr.onreadystatechange = function() { 1
			if(xhr.readyState > 2) {
		    	if (request.status == 200 || request.status == 201 || request.status == 204) {
				    var newData = xhr.responseText.substr(xhr.seenBytes);
				    if (process)
				    	process(newData);
				    xhr.seenBytes = xhr.responseText.length;
			    	if (xhr.readyState == 4 && callback)
			    		return callback();
			    	return;
		    	}
				if (request.status == 400)
					return callback("Parse error");
				if (request.status == 500)
					return callback("Server error"); 
				if (request.status == 503)
					return callback("Service not available");
				return callback("Unknown HTTP response code: " + request.status);
		  }
		};
	    
		xhr.open(method, uri);
		if (outMimeType)
	        xhr.setRequestHeader("Accept",outMimeType);
	    if (inMimeType)
	    	xhr.setRequestHeader("Content-Type",inMimeType);
	    if (inContent)
	    	xhr.send(inContent);
	    else 
	    	xhr.send();
	    
	};
	
	var _httpGetStreaming = function(uri, process, mimeType, callback) {
		return _httpRequest(uri, "GET", null, mimeType, null, process, callback);
	}
	
	var _httpPost = function (uri, mimeType, content, callback) {
		return _httpRequest(uri, "POST", mimeType, null, content, null, callback);
	}
	
	var _httpPatch = function (uri, mimeType, content, callback) {
		return _httpRequest(uri, "PATCH", mimeType, null, content, null, callback);
	}
	
	var _createCalliCreateWriter = function(folderURI, callback) {
		var writer = new N3Writer({}); // TODO: add BASE!!! (maybe)
		writer.end = function() {
			var update =
				'INSERT DATA { ' +
					_output +
				'}; ';
			return _httpPost(folderURI, 'application/sparql-update', update, callback);
		};
		return writer;
	};

	var _createCalliUpdateWriter = function(resourceURI, callback) {
		var writer = new N3Writer({}); // TODO: add BASE!!! (maybe)
		writer.end = function() {
			var update =
				'DELETE {?s ?p ?o}; ' +
				'INSERT { ' +
					_output +
				'} WHERE {?s ?p ?o}; ';
			return _httpPatch(resourceURI, 'application/sparql-update', update, callback);
		};
		return writer;
	};

//	var _readFromRemoteGraph = function(graphURI, parser, callback) {
//		return _httpGet(
//				graphURI, '???',
//				function(error, responseText) {
//					if (error)
//						return callback(error);
//					parser.addChunk(responseText);
//					parser.end();
//					return callback();
//				});
//	};

	var _readFromRemoteGraphStreaming = function(graphURI, parser, callback) {
		return _httpGetStreaming(
				graphURI,
				function(chunk) {
					parser.addChunk(responseText);
				},
				'text/turtle',
				function(error) {
					if (error)
						return callback(error);
					parser.end();
					return callback();
				});
	};

	var _writeFromRemoteGraph = function(graphURI, graphWriter, callback) {
		var parser = new N3Parser(
				function(error, triple, prefixes) {
					if (error)
						return callback("Parse Error: " + error);
					if (triple)
						return graphWriter.addTriple(
								triple.subject, triple.predicate, triple.object,
								function(error) {
									if (error)
										return callback(error);
								});
					else
						return graphWriter.end(callback);
				}
		);
		return _readFromRemoteGraphStreaming(graphURI, parser, callback);
	};

	var _calliRead = function(resourceURI, graphWriter, callback) {
		return _writeFromRemoteGraph(resourceURI, graphWriter, callback);
	}
	
	return {
		createCalliCreateWriter: _createCalliCreateWriter,
		createCalliUpdateWriter: _createCalliUpdateWriter,
		calliRead: _calliRead
	};

}());
