function linkedPlumb() {
}

var mecomp = function (localName) {
	return "http://rdf.myexperiment.org/ontologies/components/" + localName;
}

var rdf = function (localName) {
	return "http://www.w3.org/1999/02/22-rdf-syntax-ns#" + localName;
}

var dc = function (localName) {
	return "http://purl.org/dc/elements/1.1/" + localName;
}

var dcterms = function (localName) {
	return "http://purl.org/dc/terms/" + localName;
}

linkedPlumb.jsPlumbToRDF = function (componentList, jspInstance, graphWriter) {
	
	var objectIdCount = 0;
	
	
	function getId(object) {
		var objectID;
		if (!objectID && object.getParameter)
			objectID = object.getParameter("@id");
		if (!objectID && object.getId)
			objectID = object.getId();
		if (!objectID && object.id)
			objectID = object.id;
		if (!objectID) {
			objectID = "obj-" + objectIdCount++;
			object.id = objectID;
		}
		return objectID;
	}
	
	function parametersAsRDF(endpoint, endpointURI, graphWriter) {
		if (endpoint.getParameters) {
			var parameters = endpoint.getParameters();
			if (parameters) {
				console.log("Parameters " + parameters);
//				if (!parameters["@id"])
//					parameters["@id"] = objectURI;
//				var nquads = jsonld.toRDF(
//						parameters, {format : "application/nquads"},
//						function(err, dataset) {
//							var parser = N3.Parser();
//							parser.parse(
//									nquads,
//							        function (error, triple, prefixes) {
//										if (triple) {
//											console.log(triple.subject, triple.predicate, triple.object, '.');
//											graphWriter.addTriple(triple);
//										} else {
//							                console.log("# That's all, folks!", prefixes)
//											if (object.toRDF)
//												object.toRDF(objectURI, graphWriter);
//											console.log("New URI: " + objectURI);
//											callback(objectURI);
//							            }
//							        });
//						});
				for (parameterName in parameters) {
					console.log(
							"Endpoint " + endpointURI +
							" has parameter '" + parameterName +
							"' with value '" + parameters[parameterName] + "'");
					console.log(
							"and (" + endpointURI + ").getParameter(" + parameterName + ") = '" +
							endpoint.getParameter(parameterName) + "'");
					if (parameterName == "@type")
						graphWriter.addTriple(endpointURI, rdf("type"), parameters[parameterName]);
					else if (parameterName == "dcterms:title")
						graphWriter.addTriple(endpointURI, dcterms("title"), parameters[parameterName]);
					else if (parameterName != "@id")
						graphWriter.addTriple(endpointURI, parameterName, parameters[parameterName]);
				}
			}
		}
	}
	
	function fromObject(object, /*contextURI, */graphWriter/*, callback*/) {
//		var objectURI = contextURI + "/" + getId(object);
		var objectURI = getId(object);
		if (object.getType) {
			var types = object.getType();
			if (types) {
				var typeString = new String(types);
				if (typeString.length > 0) {
					console.log(objectURI + " has types '" + typeString + "' (" + typeString.split(" ") + ")");
					var typeList = typeString.split(" ");
					console.log(objectURI + " has types '" + typeString + "'");
					for (var typeIndex = 0; typeIndex < typeList.length; typeIndex++) {
						console.log(objectURI + " has type '" + typeList[typeIndex] + "'");
						graphWriter.addTriple(objectURI, rdf("type"), typeList[typeIndex]);
					}
				}
			}
		}
		if (object.getLabel)
			console.log("Label: " + object.getLabel());
		return objectURI;
	}
	
	function fromWorlkflowComponent(component, dataflowURI, graphWriter) {
		// may have a dcterms:title
		componentURI = fromObject(component, graphWriter);
		graphWriter.addTriple(dataflowURI, mecomp("has-component"), componentURI);
		graphWriter.addTriple(componentURI, mecomp("belongs-to-workflow"), dataflowURI);
		return componentURI;
	}
	
	function fromNodeComponent(component, dataflowURI, graphWriter) {
		console.log("Scanning component " + component);
//		console.log("Content: " + JSON.stringify(component));
		componentURI = fromWorlkflowComponent(component, dataflowURI, graphWriter);
		var componentElement = component.getElement();
		var endpointList = jspInstance.getEndpoints(componentElement);
		if (endpointList) {
			for (var epIndex = 0; epIndex < endpointList.length; epIndex++) {
				fromEndpoint(endpointList[epIndex], componentURI, dataflowURI, graphWriter);
			}
		}
		console.log("Component " + componentElement + " scanned");
		return componentURI;
	}
	
	function fromEndpoint(endpoint, componentURI, dataflowURI, graphWriter) {
		console.log("Scanning endpoint " + endpoint);
		endpointURI = fromWorlkflowComponent(endpoint, dataflowURI, graphWriter);
		graphWriter.addTriple(endpointURI, rdf("type"), mecomp("IOComponent"));
		graphWriter.addTriple(endpointURI, mecomp("for-component"), componentURI);
		parametersAsRDF(endpoint, endpointURI, graphWriter);
		for (var connectionIndex; connectionIndex < endpoint.connections.length; connectionIndex++) {
			var connection = endpoint.connections[connectionIndex];
			var connectionURI = getId(connection);
			if (endpoint.hasType(mecomp("Input"))) {
				graphWriter.addTriple(connectionURI, mecomp("to-input"), endpointURI);
			}
			if (endpoint.hasType(mecomp("Output"))) {
				graphWriter.addTriple(connectionURI, mecomp("from-output"), endpointURI);
			}
		}
//		graphWriter.addTriple(connectionURI,  dcterms("title"), title);
		// TODO: write endpoint data
		// TODO: return endpoint URI
		console.log("Endpoint " + endpoint + " scanned");
	}
	
	function fromConnection(connection, dataflowURI, graphWriter) {
		console.log("Scanning connection " + connection);
		var connectionURI = fromWorlkflowComponent(connection, dataflowURI, graphWriter);
		graphWriter.addTriple(dataflowURI, mecomp("Link"), connectionURI);
		graphWriter.addTriple(connectionURI, rdf("type"), mecomp("Link"));
		console.log("Connection " + connection + " scanned");
	}
	
	// may produce  dcterms:identifier for the dataflow
	
	var dataflowURI = "";
	if (componentList) {
		for (var compIndex = 0; compIndex < componentList.length; compIndex++) {
			fromNodeComponent(componentList[compIndex], dataflowURI, graphWriter);
		}
	}
	var connectionList = jspInstance.getConnections();
	if (connectionList) {
		for (var connIndex = 0; connIndex < connectionList.length; connIndex++) {
			fromConnection(connectionList[connIndex], dataflowURI, graphWriter);
			// TODO: use returned component URI to connect to dataflow URI
		}
	}
}