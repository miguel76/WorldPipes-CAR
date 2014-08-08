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
		    	if (xhr.status == 200 || xhr.status == 201 || xhr.status == 204) {
		    		if (xhr.responseText) {
		    			var newData = xhr.responseText.substr(xhr.seenBytes);
		    			if (process)
		    				process(newData);
		    			xhr.seenBytes = xhr.responseText.length;
		    		}
		    		if (xhr.readyState == 4 && callback)
		    			return callback();
			    	return;
		    	}
		    	if (xhr.readyState == 4 && callback) {
					if (xhr.status == 400)
						return callback("Parse error");
					if (xhr.status == 500)
						return callback("Server error"); 
					if (xhr.status == 503)
						return callback("Service not available");
					return callback("Unknown HTTP response code: " + xhr.status);
		    	}
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
	};
	
	var _httpPost = function (uri, mimeType, content, callback) {
		return _httpRequest(uri, "POST", mimeType, null, content, null, callback);
	};
	
	var _httpPostStreaming = function (uri, process, inMimeType, outMimeType, content, callback) {
		return _httpRequest(uri, "POST", inMimeType, outMimeType, content, process, callback);
	};
	
	var _httpPatch = function (uri, mimeType, content, callback) {
		return _httpRequest(uri, "PATCH", mimeType, null, content, null, callback);
	};
	
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

//	var _createCalliUpdateWriter = function(resourceURI, callback) {
//
//		console.log("Creating writer for " + resourceURI);
//
////		var writer = N3.Writer({}); // TODO: add BASE!!! (maybe)
//		var writer = N3.Writer(); // TODO: add BASE!!! (maybe)
//		writer.end = function() {
//			var update =
//				'DELETE { <> <http://rdf.myexperiment.org/ontologies/components/has-component> ?component. ?component ?componentP ?componentO. } ' +
//				'INSERT { ' +
//					this._output +
//				'} WHERE { OPTIONAL { <> <http://rdf.myexperiment.org/ontologies/components/has-component> ?component. ?component ?componentP ?componentO. } }; ';
//			console.log("Sending update to server: " + update);
//			return _httpPatch(resourceURI + '?describe', 'application/sparql-update', update, callback);
//		};
//		return writer;
//	};

	var _createCalliUpdateWriter = function(storeURI, resourceURI, oldGraph, callback) {

		console.log("Creating writer for " + resourceURI);
		
		var deleteWriter = N3.Writer({}); 
		var insertWriter = N3.Writer({}); 
		var newGraph = N3.Store();
		
		var newGraphWriter = {
			addTriple: function(s, p, o) {
				if (!oldGraph || oldGraph.find(s, p, o).length == 0)
					insertWriter.addTriple(s, p, o);
				newGraph.addTriple(s, p, o);
			},
			end: function() {
				if (oldGraph) {
					var oldTriples = oldGraph.find(null, null, null);
					for (var tripleIndex = 0; tripleIndex < oldTriples.length; tripleIndex++) {
						var triple = oldTriples[tripleIndex];
						var s = triple.subject, p = triple.predicate, o = triple.object;
						if (newGraph.find(s, p, o).length == 0)
							deleteWriter.addTriple(s, p, o);
					}
				}
				insertWriter.end(
						function (error, insertTurtle) {
							if (error)
								return callback(error);
							deleteWriter.end(
									function (error, deleteTurtle) {
										if (error)
											return callback(error);
										var update =
											'DELETE { ' +
												deleteTurtle +
											' } ' +
											'INSERT { ' +
												insertTurtle +
											'} WHERE { }; ';
										console.log("Sending update to server: " + update);
//										return _httpPatch(
//												resourceURI + '?describe', 'application/sparql-update',
//												update,
//												function(error) {
//													if (error)
//														callback(error)
//													callback(null, newGraph);
//												});
										return _httpPost(
												storeURI + "sparql",
												'application/sparql-update',
												update,
												function(error) {
													if (error)
														callback(error)
													callback(null, newGraph);
												});
									});
						});
			}
		};
		
//		var writer = N3.Writer(); // TODO: add BASE!!! (maybe)
//		writer.end = function() {
//			var update =
//				'DELETE { <> <http://rdf.myexperiment.org/ontologies/components/has-component> ?component. ?component ?componentP ?componentO. } ' +
//				'INSERT { ' +
//					this._output +
//				'} WHERE { OPTIONAL { <> <http://rdf.myexperiment.org/ontologies/components/has-component> ?component. ?component ?componentP ?componentO. } }; ';
//			console.log("Sending update to server: " + update);
//			return _httpPatch(resourceURI + '?describe', 'application/sparql-update', update, callback);
//		};
		return newGraphWriter;
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
					parser.addChunk(chunk);
				},
				'text/turtle',
				function(error) {
					if (error)
						return callback(error);
					parser.end();
					return callback();
				});
	};

	var _readFromQueryStreaming = function(endpointURI, query, parser, callback) {
		return _httpPostStreaming(
				endpointURI,
				function(chunk) {
					parser.addChunk(chunk);
				},
				'application/sparql-query',
				'text/turtle',
				query,
				function(error) {
					if (error)
						return callback(error);
					parser.end();
					return callback();
				});
	};
	
	var _readFromQueryStreamingOld = function(endpointURI, query, parser, callback) {
		var rdfXml = "";
		return _httpPostStreaming(
				endpointURI,
				function(chunk) {
					rdfXml += chunk;
				},
				'application/sparql-query',
				'application/rdf+xml',
				query,
				function(error) {
					if (error)
						return callback(error);
//					console.log("Loaded Graph (RDF/XML): " + rdfXml);
					var graphFromRdfXml = new RDF();
					graphFromRdfXml.loadRDFXML(rdfXml);
//					console.log("loadRDFXML result : " + graphFromRdfXml.loadRDFXML(rdfXml));
//					console.log("Loaded Graph (N-Triples): " + graphFromRdfXml.toNTriples());
					parser.addChunk(graphFromRdfXml.toNTriples());
					parser.end();
					return callback();
				});
	};
	
	var _writeFromQuery = function(endpointURI, query, graphWriter, callback) {
		var parser = N3.Parser();
		var errorValue = null;
		parser.parse(
				function(error, triple, prefixes) {
//					console.log("Parsing Triple: " + triple);
					if (!errorValue) {
						if (error)
							errorValue = error;
						else
							if (triple) {
//								console.log("Adding Triple: " + triple);
								graphWriter.addTriple(
										triple.subject,
										triple.predicate,
										triple.object);
							} else
								if (graphWriter.end)
									graphWriter.end();
					}
				}
		);
		return _readFromQueryStreamingOld(
				endpointURI, query, parser,
				function(error) {
					if (errorValue)
						callback(errorValue);
					else
						callback(error);
				});
	};

	var _writeFromRemoteGraph = function(graphURI, graphWriter, callback) {
		var parser = N3.Parser();
		var errorValue = null;
		parser.parse(
				function(error, triple, prefixes) {
					if (!errorValue) {
						if (error)
							errorValue = error;
						else
							if (triple)
								graphWriter.addTriple(
										triple.subject, triple.predicate, triple.object,
										function(error) {
											if (error)
												errorValue = error;
										});
//							else
//								if (graphWriter.end)
//									return graphWriter.end(callback);
//								else
//									return callback();
					}
				}
		);
		if (errorValue)
			return callback(errorValue);
		return _readFromRemoteGraphStreaming(graphURI, parser, callback);
	};

	var _calliRead = function(resourceURI, graphWriter, callback) {
		return _writeFromRemoteGraph(resourceURI, graphWriter, callback);
	}
	
	var _calliQuery = function(endpointURI, query, graphWriter, callback) {
		return _writeFromQuery(endpointURI, query, graphWriter, callback);
	}
	
	return {
		createCalliCreateWriter: _createCalliCreateWriter,
		createCalliUpdateWriter: _createCalliUpdateWriter,
		calliRead: _calliRead,
		calliQuery: _calliQuery
	};

}());
