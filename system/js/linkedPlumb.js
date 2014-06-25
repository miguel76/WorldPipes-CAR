function linkedPlumb() {
}

var mecomp = function (localName) {
	return "http://rdf.myexperiment.org/ontologies/components/" + localName;
}

var rdf = function (localName) {
	return "http://www.w3.org/1999/02/22-rdf-syntax-ns#" + localName;
}

linkedPlumb.jsPlumbToRDF = function (componentList, jspInstance, graphWriter) {
	
	var objectIdCount = 0;
	
	function getId(object) {
		var objectID;
		if (object.id)
			objectID = object.id;
		if (!objectID && object.getId)
			objectID = object.getId();
		if (!objectID && object.getParameter)
			objectID = object.getParameter("id");
		if (!objectID) {
			objectID = "obj-" + objectIdCount++;
			object.id = objectID;
		}
		return objectID;
	}
	
	function fromObject(object, contextURI, graphWriter) {
//		var objectURI = contextURI + "/" + getId(object);
		var objectURI = getId(object);
		if (object.getType)
			console.log(objectURI + " has type(s) " + object.getType());
		if (object.getLabel)
			console.log("Label: " + object.getLabel());
		if (object.getParameters)
			console.log("Parameters " + object.getParameters());
		// TODO: write rdf:type statements from object (endpoint or connection) types
		if (object.toRDF)
			object.toRDF(objectURI, graphWriter);
		console.log("New URI: " + objectURI);
		return objectURI;
	}
	
	function fromWorlkflowComponent(component, dataflowURI, graphWriter) {
		// may have a dcterms:title
		componentURI = fromObject(component, dataflowURI, graphWriter);
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
				fromEndpoint(endpointList[epIndex], componentURI, graphWriter);
			}
		}
		console.log("Component " + componentElement + " scanned");
		return componentURI;
	}
	
	function fromEndpoint(endpoint, componentURI, graphWriter) {
		console.log("Scanning endpoint " + endpoint);
		endpointURI = fromWorlkflowComponent(endpoint, componentURI, graphWriter);
		graphWriter.addTriple(endpointURI, rdf("type"), mecomp("IOComponent"));
		graphWriter.addTriple(endpointURI, mecomp("for-component"), componentURI);
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