/* From js object to RDF (N-Quads) */

/** 
 * jsonld.toRDF = function(input, options, callback);
 * Outputs the RDF dataset found in the given JSON-LD object.
 *
 * @param input the JSON-LD input.
 * @param [options] the options to use:
 *          [base] the base IRI to use.
 *          [expandContext] a context to expand with.
 *          [format] the format to use to output a string:
 *            'application/nquads' for N-Quads.
 *          [produceGeneralizedRdf] true to output generalized RDF, false
 *            to produce only standard RDF (default: false).
 *          [documentLoader(url, callback(err, remoteDoc))] the document loader.
 * @param callback(err, dataset) called once the operation completes.
 */

var JsonToServer = {};

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

JsonToServer._pipelineContext = { 
  "@context" : {
    "@vocab" : JsonToServer._pipelineVocabUri,
    "Code" : "@id",
    "ConnectedComponentCode" : {
      "@type" : "@id"
    },
    "Component" : "@type",
    "Id" : "@id",
    "X" : null,
    "Y" : null
  }
};

JsonToServer._layoutContext = { 
  "@context" : {
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "pipe" : JsonToServer._pipelineVocabUri,
    "Code" : "@id",
    "ConnectedComponentCode" : {
      "@id": "pipe:ConnectedComponentCode",
      "@type" : "@id"
    },
    "Component" : "@type",
    "Id" : "@id",
    "X" : {
      "@id": "pipe:X",
      "@type" : "xsd:integer"
    },
    "Y" : {
      "@id": "pipe:Y",
      "@type" : "xsd:integer"
    }
  }
};

JsonToServer._combinedContext = { 
  "@context" : {
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "@vocab" : JsonToServer._pipelineVocabUri,
    "ConnectedComponentCode" : {
      "@type" : "@id"
    },
    "Component" : "@type",
    "Id" : "@id"
  }
};

JsonToServer._readPipelineAndLayoutUris = function(graphStore, pipelineMainURI, callback) {
	var query =
		'SELECT ?label ?innerDataFolder ?pipeline ?layout ?dataflow ' +
		'WHERE { ' +
			'<' + pipelineMainURI + '> <' + JsonToServer._rdfsLabel + '> ?label . ' +
			'OPTIONAL ' +
				'{ <' + pipelineMainURI + '> <' + JsonToServer._hasInnerDataFolder + '> ?innerDataFolder . } . ' +
			'OPTIONAL ' +
				'{ <' + pipelineMainURI + '> <' + JsonToServer._hasPipelineGraph + '> ?pipeline . } . ' +
			'OPTIONAL ' +
				'{ <' + pipelineMainURI + '> <' + JsonToServer._hasPipelineLayoutGraph + '> ?layout . } . ' +
			'OPTIONAL ' +
				'{ <' + pipelineMainURI + '> <' + JsonToServer._hasDataflowGraph + '> ?dataflow . } . ' +
		'} ';
	return JsonToServer._httpGet(
			graphStore + '?query=' + encodeURIComponent(query),
			'application/sparql-results+xml',
			function(err,resultText, resultXML) {
				if (err)
					return callback(err);
				else {
					if (!resultXML)
						return callback('Server did not reply XML');
					else {
						var label = null;
						var folderUri = null;
						var pipelineUri = null;
						var layoutUri = null;
						var dataflowUri = null;
						var bindings = resultXML.getElementsByTagNameNS('http://www.w3.org/2005/sparql-results#', 'binding');
						for (var bindingIndex = 0; bindingIndex < bindings.length; bindingIndex++) {
							var binding = bindings.item(bindingIndex);
							var name = binding.getAttribute('name');
							var uris = binding.getElementsByTagNameNS('http://www.w3.org/2005/sparql-results#', 'uri');
							var uri = (uris && uris.item(0)) ? uris.item(0).textContent : null;
							var literals = binding.getElementsByTagNameNS('http://www.w3.org/2005/sparql-results#', 'literal');
							var literal = (literals && literals.item(0)) ? literals.item(0).textContent : null;
						    if (name == 'label') {
						    	label = literal;
						    } else if (name == 'innerDataFolder') {
						    	folderUri = uri;
						    } else if (name == 'pipeline') {
						    	pipelineUri = uri;
						    } else if (name == 'layout') {
						    	layoutUri = uri;
						    } else if (name == 'dataflow') {
						    	dataflowUri = uri;
						    }
						}
						return callback(null, label, folderUri, pipelineUri, layoutUri, dataflowUri);
					}
				}
			});
};
	
JsonToServer._graphComponentTurtle = function(parentURI, graphURI) {
//	alert('<' + parentURI + '> <' + JsonToServer._hasComponent + '> <' + graphURI + '> . ' +
//		'<' + graphURI + '> ' +
//			'a <callimachus/1.0/types/GraphDocument> , <http://www.w3.org/ns/sparql-service-description#NamedGraph> , <http://xmlns.com/foaf/0.1/Document> ; ' +
//		    'rdfs:label "prova" . ');
	return '';//(
//		'<' + parentURI + '> <' + JsonToServer._hasComponent + '> <' + graphURI + '> . ' +
//		'<' + graphURI + '> ' +
//			'a <callimachus/1.0/types/GraphDocument> , <http://www.w3.org/ns/sparql-service-description#NamedGraph> , <http://xmlns.com/foaf/0.1/Document> ; ' +
//		    'rdfs:label "prova" . ');
};

JsonToServer._writePipelineAndLayoutUris = function(graphStore, pipelineMainURI, folderUri, pipelineUri, layoutUri, dataflowUri, callback) {
	var update =
		'INSERT { ' +
			( folderUri ?
					(
						'<' + pipelineMainURI + '> <' + JsonToServer._hasInnerDataFolder + '> <' + folderUri + '> . ' +
						JsonToServer._graphComponentTurtle(pipelineMainURI, folderUri) ) :
					'' ) +
			( pipelineUri ?
					( 
						'<' + pipelineMainURI + '> <' + JsonToServer._hasPipelineGraph + '> <' + pipelineUri + '> . ' +
						JsonToServer._graphComponentTurtle(pipelineMainURI, pipelineUri) ) :
					'' ) +
			( layoutUri ?
					(
						'<' + pipelineMainURI + '> <' + JsonToServer._hasPipelineLayoutGraph + '> <' + layoutUri + '> . ' +
						JsonToServer._graphComponentTurtle(pipelineMainURI, layoutUri) ) :
					'' ) +
			( dataflowUri ?
					(
						'<' + pipelineMainURI + '> <' + JsonToServer._hasDataflowGraph + '> <' + dataflowUri + '> . ' +
						JsonToServer._graphComponentTurtle(pipelineMainURI, dataflowUri) ) :
					'' ) +
		'} '+
		'WHERE { }; ';
	return JsonToServer._httpPost(graphStore, 'application/sparql-update', null, update, callback);
};

JsonToServer._createFolder = function(baseURI, folderName, folderLabel, callback) {
	var update =
		'INSERT DATA { ' +
			'<' + baseURI + folderName + '/> a <' + JsonToServer._Folder + '>, </callimachus/1.3/types/Folder>; ' +
			'<' + JsonToServer._rdfsLabel + '> "' + folderLabel + '". ' +
		'} ';
	return JsonToServer._httpPost(baseURI + '?describe', 'application/sparql-update', null, update, callback);
//	return callback(null);
}

//JsonToServer._resourceExists = function(uri, callback) {
//	var update =
//		'INSERT DATA { ' +
//			'<' + baseURI + folderName + '/> a <' + JsonToServer._Folder + '>, </callimachus/1.3/types/Folder>; ' +
//			'<' + JsonToServer._rdfsLabel + '> "' + folderLabel + '". ' +
//		'} ';
//	return JsonToServer._httpOptions(baseURI + '?describe', 'application/sparql-update', null, update, callback);
////	return callback(null);
//}

JsonToServer._getPipelineAndLayoutUris = function(graphStore, pipelineMainURI, callback) {
	return JsonToServer._readPipelineAndLayoutUris(
			graphStore,
			pipelineMainURI, 
			function(err, pipelineMainLabel, folderUri, pipelineUri, layoutUri, dataflowUri) {
				if (err)
					return callback(err);
				else {
					var folderToBeCreated = !folderUri;
					var pipelineUriToBeWritten = !pipelineUri;
					var layoutUriToBeWritten = !layoutUri;
					var dataflowUriToBeWritten = !dataflowUri;
					var saveLinks = function(folderUri) {
						if (pipelineUriToBeWritten) {
							pipelineUri = folderUri + '/pipeline';
						}
						if (layoutUriToBeWritten) {
							layoutUri = folderUri + '/pipeline-layout';
						}
						if (dataflowUriToBeWritten) {
							dataflowUri = folderUri + '/dataflow';
						}
						if (folderToBeCreated || pipelineUriToBeWritten || layoutUriToBeWritten || dataflowUriToBeWritten)
							return JsonToServer._writePipelineAndLayoutUris(
									graphStore, pipelineMainURI,
									folderToBeCreated ? folderUri : null,
									pipelineUriToBeWritten ? pipelineUri : null,
									layoutUriToBeWritten ? layoutUri : null,
									dataflowUriToBeWritten ? dataflowUri : null,
									function(err) {
										if (err)
											return callback(err);
										else
											return callback(null, pipelineUri, layoutUri, dataflowUri);
									});
						else
							return callback(null, pipelineUri, layoutUri, dataflowUri);
					}
					if (folderToBeCreated) {
						return JsonToServer._decomposeURI(
								pipelineMainURI,
								function(baseURI, pipelineName) {
									var folderName = pipelineName + '-Internal-Data';
									var folderLabel = pipelineMainLabel + ' Internal Data';
									return JsonToServer._createFolder(
											baseURI, folderName, folderLabel,
											function(err) {
												if (err)
													return callback(err);
												else {
													folderUri = baseURI + folderName;
													return saveLinks(folderUri);
												}
											}
									);
								}
						);
					} else {
						return saveLinks(folderUri);
					}
				}
			});
};

JsonToServer._conversionContext = JsonToServer._componentsBase;

JsonToServer._uriEncode =
	function (graphStore, graphName) {
		return (
				(graphStore == null)
						? graphName
						: graphStore + encodeURIComponent(graphName) );
	};

JsonToServer._jsonEncode =
  function (key, value) {
    if (value == null || value === '') {
      return undefined;
    }
    if (key === 'Code') {
      JsonToServer._conversionContext = JsonToServer._componentsBase + value + '/';
      return JsonToServer._componentsBase + value;
    }
    if (key === 'ConnectedComponentCode') {
      return JsonToServer._componentsBase + value;
    }
    if (key === 'Id') {
      return JsonToServer._conversionContext + value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return value;
  };

JsonToServer._jsonConvertValues =
  function (obj, convert) {
    return JSON.parse( JSON.stringify( obj, convert ) );
  };

JsonToServer._httpPost = function (uri, mimeType, slug, content, callback) {
    try{var request = new XMLHttpRequest();}
    catch(error){var request = null;}

    if (request == null) {
      callback("Invalid Request");
    } else {
      request.open("POST", uri, false);
      if (mimeType)
    	  request.setRequestHeader("Content-Type",mimeType);
      if (slug)
    	  request.setRequestHeader("Slug",slug);
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


JsonToServer._generateSaveNQ =
  function (graphStore, graphName) {
    return function(err, nqString) {

      if (err != null) { alert("JSON-LD conversion error: " + JSON.stringify(err)); return; };

      try{var request = new XMLHttpRequest();}
      catch(error){var request = null;}
  
      if (request == null) {
        alert("ERROR! Invalid Request");
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


JsonToServer.savePipelineAndLayout = function (graphStore, pipelineURI, layoutURI, componentsVector, callback) {
	
  if (!callback)
	  return JsonToServer.savePipelineAndLayout(
			  graphStore, pipelineURI, layoutURI, componentsVector,
			  function(err, result) {
				  if (err)
					  alert('Error: ' + err);
//				  else
//					  alert('Pipeline Saved');
			  });
	
  var jsonModified = JsonToServer._jsonConvertValues(componentsVector, JsonToServer._jsonEncode);
//  alert(JSON.stringify(jsonModified));
  
  return jsonld.toRDF(
      jsonModified,
      { "base" : pipelineURI, 
        "expandContext" : JsonToServer._pipelineContext,
        "format" : "application/nquads"
//        "format" : "application/n-triples"
      },
      function(err, result) {
    	  if (err)
    		  return callback(err);
    	  else
    		  return JsonToServer._saveTurtle(
    				  null, //graphStore,
    				  pipelineURI,
    				  result,
    				  function(err, result) {
    			    	  if (err)
    			    		  return callback(err);
    			    	  else
    			    		  return jsonld.toRDF(
    			    				  jsonModified,
    			    				  { "base" : pipelineURI, 
    			    					  "expandContext" : JsonToServer._layoutContext,
    			    					  "format" : "application/nquads"
//    						        	"format" : "application/n-triples"
    			    				  },
    			    				  function(err, result) {
        		    			    	  if (err)
        		    			    		  return callback(err);
        		    			    	  else
        		    			    		  return JsonToServer._saveTurtle(
        		    			    				  null, //graphStore,
        		    			    				  layoutURI,
        		    			    				  result,
        		    			    				  callback);
    			    				  });
    				  });
      });


};

JsonToServer.saveDataflow = function (dataflowURI, dataflowTurtle, callback) {
	return JsonToServer._saveTurtle(null, dataflowURI, dataflowTurtle, callback);
};

JsonToServer.savePipelineData = function (graphStore, pipelineMainURI, componentsVector) {

	return JsonToServer._getPipelineAndLayoutUris(
			graphStore,
			pipelineMainURI,
			function(err, pipelineURI, layoutURI, dataflowUri) {
				if (err)
					alert('Error: ' + err);
				else
					JsonToServer.savePipelineAndLayout(graphStore + '?graph=', pipelineURI, layoutURI, componentsVector);
			});
	
};

JsonToServer.saveAll = function (graphStore, pipelineMainURI, dataflowTurtle, componentsVector) {
	return JsonToServer._getPipelineAndLayoutUris(
			graphStore,
			pipelineMainURI,
			function(err, pipelineURI, layoutURI, dataflowUri) {
				if (err)
					alert('Error: ' + err);
				else
					JsonToServer.saveDataflow(
							dataflowUri, dataflowTurtle,
							function(err) {
								if (err)
									alert('Error: ' + err);
								else
									JsonToServer.savePipelineAndLayout(graphStore + '?graph=', pipelineURI, layoutURI, componentsVector);
							}
					);
			});
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
    img.src = null; // no server request
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
	  JsonToServer._httpGet(
			  JsonToServer._uriEncode(graphStore, graphName),
			  "text/turtle",
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
				if (triple)
					triplesText +=
						"<" + triple.subject + "> <" + triple.predicate + "> " +
						(triple.object.substr(0, 1) == '"' ? triple.object : "<" + triple.object + ">") + ".\n";
				else {
//					alert(triplesText);
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

JsonToServer.loadPipelineAndLayout = function(graphStore, pipelineURI, layoutURI, callback) {
    JsonToServer._loadNQ(
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
								graphStore + '?graph=',
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



