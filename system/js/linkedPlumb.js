function linkedPlumb() {
}

var mecomp = function (localName) {
	return "http://rdf.myexperiment.org/ontologies/components/" + localName;
}

var rdf = function (localName) {
	return "http://www.w3.org/1999/02/22-rdf-syntax-ns#" + localName;
}

linkedPlumb.jsPlumb2Turtle = function (componentElementList, jspInstance, graphWriter) {
	
	function writeTypes(typedObject, objectURI, graphWriter) {
		console.log(objectURI + " has type(s) " + typedObject.getType());
		console.log("Label: " + endpoint.getLabel());
		console.log("Parameters " + JSON.stringify(endpoint.getParameters()));
		// TODO: write rdf:type statements from object (endpoint or connection) types
	}
	
	function fromComponentElement(componentElement, graphWriter) {
		console.log("Scanning component " + componentElement);
		// TODO: generate component URI
		var componentURI = componentElement.hasAttribute("id") ? componentElement.getAttribute("id") : "";
		// TODO: write component data
		var endpointList = jspInstance.getEndpoints(componentElement);
		if (endpointList) {
			for (var epIndex = 0; epIndex < endpointList.length; epIndex++) {
				fromEndpoint(endpointList[epIndex], graphWriter);
			}
		}
		// TODO: return component URI
		console.log("Component " + componentElement + " scanned");
		return componentURI;
	}
	
	function fromEndpoint(endpoint, graphWriter) {
		console.log("Scanning endpoint " + endpoint);
		// TODO: generate endpoint URI
		var endpointURI = endpoint.getUuid();
		writeTypes(endpoint, endpointURI, graphWriter);
		// TODO: write endpoint data
		// TODO: return endpoint URI
		console.log("Endpoint " + endpoint + " scanned");
	}
	
	function fromConnection(connection, graphWriter) {
		console.log("Scanning connection " + connection);
		// TODO: generate connection URI
		var connectionURI = "boh";
		writeTypes(connection, connectionURI, graphWriter);
//		graphWriter.addTriple(connectionURI, rdf("type"), mecomp("Link"));
		// TODO: write connection data
		// TODO: return connection URI
		console.log("Connection " + connection + " scanned");
	}
	
	// TODO: generate dataflow URI
	// TODO: write dataflow data
	if (componentElementList) {
		for (var compIndex = 0; compIndex < componentElementList.length; compIndex++) {
			fromComponentElement(componentElementList[compIndex], graphWriter);
		}
	}
	var connectionList = jspInstance.getConnections();
	if (connectionList) {
		for (var connIndex = 0; connIndex < connectionList.length; connIndex++) {
			fromConnection(connectionList[connIndex], graphWriter);
			// TODO: use returned component URI to connect to dataflow URI
		}
	}
}