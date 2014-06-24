function linkedPlumb() {
}

linkedPlumb.jsPlumb2Turtle = function (componentElementList, jspInstance, graphWriter) {
	
	function writeTypes(typedObject, objectURI, graphWriter) {
		console.log(objectURI + " has type(s) " + typedObject.getType());
		// TODO: write rdf:type statements from object (endpoint or connection) types
	}
	
	function fromComponentElement(componentElement, graphWriter) {
		// TODO: generate component URI
		// TODO: write component data
		var endpointList = jspInstance.getEndpoints(componentElement);
		for (var epIndex = 0; epIndex < endpointList.length; epIndex++) {
			fromEndpoint(endpointList[epIndex], graphWriter);
		}
		// TODO: return component URI
	}
	
	function fromEndpoint(endpoint, graphWriter) {
		// TODO: generate endpoint URI
		var endpointURI = ep.getUuid();
		writeTypes(endpoint, endpointURI, graphWriter);
		endpoint.getLabel();
		ep.getParameters();
		// TODO: write endpoint data
		// TODO: return endpoint URI
	}
	
	function fromConnection(connection, graphWriter) {
		// TODO: generate connection URI
		writeTypes(endpoint, objectURI, graphWriter);
		// TODO: write connection data
		// TODO: return connection URI
	}
	
	// TODO: generate dataflow URI
	// TODO: write dataflow data
	for (var compIndex = 0; compIndex < componentElementList.length; compIndex++) {
		fromComponentElement(componentElementList[compIndex], graphWriter);
	}
	var connectionList = jspInstance.getConnections();
	for (var connIndex = 0; connIndex < connectionList.length; connIndex++) {
		fromConnection(connectionList[connIndex], graphWriter);
		// TODO: use returned component URI to connect to dataflow URI
	}
}