var N3ServerSync = (function() {

	JsonToServer._httpPost = function (uri, mimeType, slug, content, callback) {
	    try { var request = new XMLHttpRequest(); }
	    catch(error) { var request = null; }
	    if (request == null)
	      return callback("Invalid Request");
	    request.onreadystatechange = function() {
	    	if (request.readyState === 4) {
		    	if (request.status == 200 || request.status == 201 || request.status == 204) {
			    	if (callback)
			    		return callback();
			    	return;
		    	}
				if (request.status == 400)
					return callback("Parse error");
				if (request.status == 500)
					return callback("Server error"); 
				if (request.status == 503) {
					return callback("Service not available");
				return callback("Unknown HTTP response code: " + request.status);
			}
		};
	    
	    request.open("POST", uri);
	    if (mimeType)
	    	request.setRequestHeader("Content-Type",mimeType);
	    if (slug)
	    	request.setRequestHeader("Slug",slug);
	    request.send(content);
	    
	};
		
	var _createRemoteGraphWriter: function(storeURI, callback) {
		var writer = new N3Writer({}); // TODO: add BASE!!! (maybe)
		writer.end = function() {
			var update =
				'INSERT { ' +
					_output +
				'} '+
				'WHERE { }; ';
			return _httpPost(graphStore, 'application/sparql-update', null, update, callback);
		};
		return writer;
	};

	return {

	};
	
	JsonToServer._pipelineVocabUri = "http://www.swows.org/2013/09/pipeline#";
JsonToServer._hasInnerDataFolder = JsonToServer._pipelineVocabUri + "hasInnerDataFolder";
JsonToServer._hasPipelineGraph = JsonToServer._pipelineVocabUri + "hasPipelineGraph";
JsonToServer._hasPipelineLayoutGraph = JsonToServer._pipelineVocabUri + "hasPipelineLayoutGraph";
JsonToServer._hasDataflowGraph = JsonToServer._pipelineVocabUri + "hasDataflowGraph";

JsonToServer._callVocabUri = "http://callimachusproject.org/rdf/2009/framework#";
JsonToServer._hasComponent = JsonToServer._callVocabUri + "hasComponent";
JsonToServer._Folder = JsonToServer._callVocabUri + "Folder";

JsonToServer._rdfsUri = "http://www.w3.org/2000/01/rdf-schema#";
JsonToServer._rdfsLabel = JsonToServer._rdfsUri + "label";

JsonToServer._componentsBase = "components/";

JsonToServer._httpPut = function (uri, mimeType, content, callback) {
    try{var request = new XMLHttpRequest();}
    catch(error){var request = null;}

    if (request == null) {
      callback("Invalid Request");
    } else {
      request.open("PUT", uri, false);
      request.setRequestHeader("Content-Type",mimeType);
      request.send(content);
      if(request.status == 200 || request.status == 201 || request.status == 204) {
    	  if (callback)
    		  callback();
      }
      if(request.status == 400 ){callback("Parse error");}
      if(request.status == 500 ){callback("Server error");} 
      if(request.status == 503 ){callback("Service not available");}
    }
};
	
JsonToServer._decomposeURI =  function (uri, callback) {
	var baseUriLength = uri.lastIndexOf('/') + 1;
	var baseUri = uri.substring(0,baseUriLength);
	var localPart = uri.substring(baseUriLength);
	return callback(baseUri, localPart);
}

JsonToServer._checkContentInFolder =  function (folderUri, fileUri, callback) {
	return JsonToServer._httpGet(
			folderUri + "?contents",
			'application/atom+xml',
			function(err,resultText, resultXML) {
				if (err)
					return callback(err);
				else {
					if (!resultXML)
						return callback('Server did not reply XML');
					else {
						var ids = resultXML.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'id');
						for (var idIndex = 0; idIndex < ids.length; idIndex++) {
							var uri = ids.item(idIndex).textContent;
//							alert(uri);
							if (uri == fileUri)
								return callback(null,true);
						}
						return callback(null, false);
					}
				}
			});
}

JsonToServer._saveTurtle =  function (graphStore, graphName, graphTurtle, callback) {
	if (graphStore)
		return JsonToServer._httpPut(
				JsonToServer._uriEncode(graphStore, graphName),
				"text/turtle",
				graphTurtle,
				callback);
	else
		return JsonToServer._decomposeURI(
				graphName,
				function(folderUri, fileName) {
					return JsonToServer._checkContentInFolder(
							folderUri,
							graphName,
							function(err, found) {
								if (err)
									return callback(err);
								else {
									if (found)
										return JsonToServer._httpPut(
												graphName,
												"text/turtle",
												graphTurtle,
												callback);
									else
										return JsonToServer._httpPost(
												folderUri + "?contents",
												"text/turtle",
												fileName,
												graphTurtle,
												callback);
								}
							}
					);
				});
};

JsonToServer._saveJsonLd =  function (graphStore, graphName, graphJsonLd, callback) {
	if (graphStore)
		return JsonToServer._httpPut(
				JsonToServer._uriEncode(graphStore, graphName),
				"application/json",
				graphJsonLd,
				callback);
	else
		return JsonToServer._decomposeURI(
				graphName,
				function(folderUri, fileName) {
					return JsonToServer._checkContentInFolder(
							folderUri,
							graphName,
							function(err, found) {
								if (err)
									return callback(err);
								else {
									if (found)
										return JsonToServer._httpPut(
												graphName,
												"application/json",
												graphJsonLd,
												callback);
									else
										return JsonToServer._httpPost(
												folderUri + "?contents",
												"application/json",
												fileName,
												graphJsonLd,
												callback);
								}
							}
					);
				});
};


JsonToServer._generateSaveNQ =
  function (graphStore, graphName) {
    return function(err, nqString) {

      if (err != null) { alert("JSON-LD conversion error: " + JSON.stringify(err)); return; };

      try{var request = new XMLHttpRequest();}
      catch(error){var request = null;}
  
      if (request == null) {
        alert("ERROR! Invalid Request");
        updateStatus('Error Saving Pipeline');
      } else {
        request.open("PUT", JsonToServer._uriEncode(graphStore, graphName), false);
//        request.setRequestHeader("Content-Type","application/n-quads");
//        request.setRequestHeader("Content-Type","application/n-triples");
        request.setRequestHeader("Content-Type","text/turtle");
        request.send(nqString);
        if(request.status == 200 || request.status == 201 || request.status == 204) {
//          alert("Data sent to " + graphName);
        }
        if(request.status == 400 ){alert("Parse error");}
        if(request.status == 500 ){alert("Server error");} 
        if(request.status == 503 ){alert("Service not available");}
      }
    };
};

JsonToServer.savePipelineAndLayout = function (graphStore, mainURI, pipelineURI, layoutURI, componentsVector, callback) {
	
//  alert(JSON.stringify(componentsVector));
  var jsonModified = JsonToServer._jsonConvertValues(componentsVector, JsonToServer._jsonEncode);
//  alert(JSON.stringify(jsonModified));
  
//  return jsonld.toRDF(
//      jsonModified,
//      { "base" : pipelineURI, 
//        "expandContext" : JsonToServer._pipelineContext,
//        "format" : "application/nquads"
////        "format" : "application/n-triples"
//      },
  return jsonLdToTriG.convert(
		  jsonModified, pipelineURI, JsonToServer._pipelineContext,
//  return jsonld.expand(
//	      jsonModified,
//	      { "base" : null, 
//	        "expandContext" : JsonToServer._pipelineContext
//	      },
      function(err, result) {
    	  if (err)
    		  return callback(err);
    	  else
    		  return JsonToServer._saveTurtle(
//    		  return JsonToServer._saveJsonLd(
    				  null, //graphStore,
    				  pipelineURI,
    				  /*"@base <../> .\n\n" + */result,
    				  function(err, result) {
    			    	  if (err)
    			    		  return callback(err);
    			    	  else
//    			    		  return jsonld.toRDF(
//    			    				  jsonModified,
//    			    				  { "base" : pipelineURI, 
//    			    					  "expandContext" : JsonToServer._layoutContext,
//    			    					  "format" : "application/nquads"
////    						        	"format" : "application/n-triples"
//    			    				  },
    			    		  return jsonLdToTriG.convert(
    			    				  jsonModified, layoutURI, JsonToServer._layoutContext,
//    			    		  return jsonld.expand(
//    			    			      jsonModified,
//    			    			      { "base" : null, 
//    			    			        "expandContext" : JsonToServer._layoutContext
//    			    			      },
    			    				  function(err, result) {
        		    			    	  if (err)
        		    			    		  return callback(err);
        		    			    	  else
//        		    			    		  return JsonToServer._saveJsonLd(
        		    			    		  return JsonToServer._saveTurtle(
        		    			    				  null, //graphStore,
        		    			    				  layoutURI,
        		    			    				  /*"@base <../> .\n\n" + */result,
        		    			    				  callback);
    			    				  });
    				  });
      });


};

JsonToServer.saveDataflow = function (dataflowURI, dataflowTurtle, callback) {
	return JsonToServer._saveTurtle(null, dataflowURI, dataflowTurtle, callback);
};

JsonToServer.savePipelineData = function (graphStore, pipelineMainURI, componentsVector, callback) {

	return JsonToServer._getPipelineAndLayoutUris(
			graphStore,
			pipelineMainURI,
			function(err, pipelineURI, layoutURI, dataflowUri) {
				if (err) {
					callback(err);
				} else
					JsonToServer.savePipelineAndLayout(graphStore + '?graph=', pipelineMainURI, pipelineURI, layoutURI, componentsVector, callback);
			});
	
};

JsonToServer.saveAll = function (graphStore, pipelineMainURI, dataflowTurtle, componentsVector, callback) {
	updateStatus(
			'Saving Pipeline...',
			function() {
				return JsonToServer._getPipelineAndLayoutUris(
						graphStore,
						pipelineMainURI,
						function(err, pipelineURI, layoutURI, dataflowUri) {
							if (err) {
								callback(err);
							}
							else
								JsonToServer.saveDataflow(
										dataflowUri, dataflowTurtle,
										function(err) {
											if (err) {
												callback(err);
											} else
												JsonToServer.savePipelineAndLayout(graphStore + '?graph=', pipelineMainURI, pipelineURI, layoutURI, componentsVector, callback);
										}
								);
						});
			} );
};

/* From RDF (N-Quads) to js object */

/** jsonld.fromRDF
 *
 * Converts an RDF dataset to JSON-LD.
 *
 * @param dataset a serialized string of RDF in a format specified by the
 *          format option or an RDF dataset to convert.
 * @param [options] the options to use:
 *          [format] the format if input is not an array:
 *            'application/nquads' for N-Quads (default).
 *          [useRdfType] true to use rdf:type, false to use @type
 *            (default: false).
 *          [useNativeTypes] true to convert XSD types into native types
 *            (boolean, integer, double), false not to (default: false).
 *
 * @param callback(err, output) called once the operation completes.
 */

/** jsonld.compact(input, ctx, options, callback)
 * Performs JSON-LD compaction.
 *
 * @param input the JSON-LD input to compact.
 * @param ctx the context to compact with.
 * @param [options] options to use:
 *          [base] the base IRI to use.
 *          [compactArrays] true to compact arrays to single values when
 *            appropriate, false not to (default: true).
 *          [graph] true to always output a top-level graph (default: false).
 *          [expandContext] a context to expand with.
 *          [skipExpansion] true to assume the input is expanded and skip
 *            expansion, false not to, defaults to false.
 *          [documentLoader(url, callback(err, remoteDoc))] the document loader.
 * @param callback(err, compacted, ctx) called once the operation completes.
 */

//JsonToServer._jsonLdProcessor = new JsonLdProcessor();

JsonToServer.qualifyURL = function (url) {
    var img = document.createElement('img');
    img.src = url; // set string url
    url = img.src; // get qualified/absolute url
    //img.src = null; // no server request
    delete img.src;
    delete img;
    return url;
}

JsonToServer._httpGet = function (uri, mimeType, callback) {
    try{var request = new XMLHttpRequest();}
    catch(error){var request = null;}

    if (request == null) {
//      alert("ERROR! Invalid Request");
    	return callback("Invalid Request");
    } else {
        request.open("GET",	uri, false);
        request.setRequestHeader("Accept",mimeType);
        request.send();
        if(request.status == 200 || request.status == 201 || request.status == 204) {
        	return callback(null,request.responseText,request.responseXML);
        }
        if (request.status == 400) {
        	return callback("Parse error");
        }
        if (request.status == 500) {
        	return callback("Server error");
        } 
        if (request.status == 503) {
        	return callback("Service not available");
        }
        return callback("Unknown HTTP Status: " + request.status);
    }
}

JsonToServer._loadNQ = function (graphStore, graphName, callback) {
	if (graphStore == null) {
		return JsonToServer._httpGet(
				  graphName,
//				  "application/n-triples",
				  "text/turtle",
//				  callback);
				  function(err,result) {
					  if (err)
						  return callback(err);
					  else
						  return JsonToServer._fromTurtleToTriples(
				        			JsonToServer.qualifyURL(graphName),
				        			result,
				        			callback);
				  });
	}
	return JsonToServer._httpGet(
			  JsonToServer._uriEncode(graphStore, graphName),
			  "text/turtle",
//			  callback);
			  function(err,result) {
				  if (err)
					  return callback(err);
				  else
					  return JsonToServer._fromTurtleToTriples(
			        			JsonToServer.qualifyURL(graphStore.substr(0,graphStore.lastIndexOf("/")+1)),
			        			result,
			        			callback);
			  });
}

JsonToServer._loadJsonLd = function (graphStore, graphName, callback) {
	if (graphStore == null) {
		return JsonToServer._httpGet(
				  graphName,
//				  "application/n-triples",
				  "application/ld+json",
				  callback);
	}
	return JsonToServer._httpGet(
			  JsonToServer._uriEncode(graphStore, graphName),
			  "application/ld+json",
//			  callback);
			  function(err,result) {
				  if (err)
					  return callback(err);
				  else
					  return JsonToServer._fromTurtleToTriples(
			        			JsonToServer.qualifyURL(graphStore.substr(0,graphStore.lastIndexOf("/")+1)),
			        			result,
			        			callback);
			  });
}

JsonToServer._compact = function(input, pipelineURI, callback) {
  jsonld.compact(
    input,
    JsonToServer._combinedContext,
    { "base" : pipelineURI, 
      "skipExpansion" : true,
      "compactArrays" : false
    },
    function(err, compacted, ctx) { callback(err,compacted) } );
}

JsonToServer._theFrame = {
  "@context" : JsonToServer._combinedContext["@context"],
  "@type" : ["input","inputdefault","output","outputdefault","construct","updatable","pipe","union","dataset"], 
  "Code" : { "@default" : "@id"},
  "InputList" : { 
    "ConnectedComponentCode" : {
      "@embed":false
    }
  }
}

JsonToServer._frame = function(pipelineURI, input, callback) {
  jsonld.frame(
    input,
    JsonToServer._theFrame,
    { "base" : pipelineURI, 
      "skipExpansion" : true,
      "omitDefault" : false
    },
    function(err, framed, ctx) { callback(err,framed["@graph"]) } );
}

JsonToServer._normalizeLiteral = function(literal) {
//	console.log("literal before: '" + literal + "'");
//	console.log("literal after: '" + literal.replace(/\n/g,'\\n').replace(/\r/g,'\\r') + "'");
	var endQuoteIndex = literal.lastIndexOf('"');
	return '"' + literal.substr(1,endQuoteIndex-1).replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/"/g,'\\"') + literal.substr(endQuoteIndex);
}

JsonToServer._fromTurtleToTriples = function(turtleBase,turtleText,receiveTriples) {
	var parser = N3.Parser();
	var triplesText = "";
	parser.parse(
			"@base <" + turtleBase + ">.\n" + turtleText,
			function(error, triple, prefixes) {
				if (error) {
					receiveTriples(error,null);
					return;
				}
				if (triple) {
					triplesText +=
						"<" + triple.subject + "> <" + triple.predicate + "> " +
						(triple.object.substr(0, 1) == '"' ? JsonToServer._normalizeLiteral(triple.object) : "<" + triple.object + ">") + ".\n";
				}
				else {
//					console.log(triplesText);
					receiveTriples(null,triplesText);
				}
			});
}

//JsonToServer.loadPipelineAndLayout = function(graphStore, pipelineURI, layoutURI, callback) {
//  jsonld.fromRDF(
//    JsonToServer._loadNQ(graphStore,pipelineURI) + JsonToServer._loadNQ(graphStore,layoutURI),
//    { "format" : "application/nquads",
////    { "format" : "application/n-triples",
//      "useNativeTypes": true },
//    function(err, output) {
//      if (err)
//        callback(err, output);
//      else {
////        alert("From RDF:" + JSON.stringify(output));
//        JsonToServer._frame(
//          output,
//          function(err, framed) {
//            if (err)
//              callback(err, framed);
//            else {
//              callback(null, JsonToServer._jsonConvertValues(framed, JsonToServer._jsonDecode));
//            }
//          }               
//        );
//      }
//    }
//  );
//}

JsonToServer.loadPipelineAndLayout = function(graphStore, mainURI, pipelineURI, layoutURI, callback) {
	try {
		return JsonToServer._loadNQ(
    		graphStore,
    		pipelineURI,
    		function(err, pipelineTriples) {
    			if (err)
    				callback(err, null);
    			else
    				JsonToServer._loadNQ(
    						graphStore,
    						layoutURI,
    			    		function(err, layoutTriples) {
    			    			if (err)
    			    				callback(err, null);
    			    			else
    			    				  jsonld.fromRDF(
    			    						  pipelineTriples + layoutTriples,
    			    						  { "format" : "application/nquads",
    			    							"useNativeTypes": true },
    			    						  function(err, output) {
    			    						      if (err)
    			    						        callback(err, output);
    			    						      else {
    			    						        JsonToServer._frame(
    			    						          pipelineURI,
    			    						          output,
    			    						          function(err, framed) {
    			    						            if (err)
    			    						              callback(err, framed);
    			    						            else {
    			    						              callback(null, JsonToServer._jsonConvertValues(framed, JsonToServer._jsonDecode));
    			    						            }
    			    						          }               
    			    						        );
    			    						      }
    			    						    });
    						});
    		});
		} catch(exception) {
			return callback(exception);
		}
	}

JsonToServer.loadPipelineData = function(graphStore, pipelineMainURI, callback) {
	return JsonToServer._readPipelineAndLayoutUris(
			graphStore,
			pipelineMainURI,
			function(err, pipelineMainLabel, folderURI, pipelineURI, layoutURI, dataflowURI) {
				if (err)
					return callback(err);
				else
					if (pipelineURI)
						return JsonToServer.loadPipelineAndLayout(
//								graphStore + '?graph=',
								null,
								pipelineMainURI,
								pipelineURI, layoutURI,
								callback);
					else
						return callback(null, []);
			});
}

JsonToServer._conversionContext = "";
JsonToServer._componentId = "";

JsonToServer._jsonDecode = function (key, value) {
    if (key === "Id") {
      var id = value.substr(JsonToServer._componentsBase.length);
      if (id.search("/") > 0)
        return id.substr(JsonToServer._conversionContext.length);
      else {
        JsonToServer._conversionContext = id + '/';
        JsonToServer._componentId = id;
        return undefined;
      }
    }
    if (value === "@id") {
      return JsonToServer._componentId;
    }
    if (key === "Component" && value instanceof Array) {
      return value[0];
    }
    if (key === "InputList" && !(value instanceof Array) ) {
      if (value == null)
        return [];
      return [value];
    }
    if (key === "ConnectedComponentCode") {
      return String(value).substr(JsonToServer._componentsBase.length);
    }

    return value;

};

}());
