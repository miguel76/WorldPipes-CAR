var linkedPlumb = (function() {
	
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

	var graphic = function (localName) {
		return "http://purl.org/viso/graphic/" + localName;
	}

	var calli = function (localName) {
		return "http://callimachusproject.org/rdf/2009/framework#" + localName;
	}
	
	return {
		
		jsPlumbToRDF: function (componentList, jspInstance, graphWriter, dataflowURI) {
	
			var objectIdCount = 0;
			
			var base = function(relativeURI) {
				return URI(relativeURI).absoluteTo(dataflowURI).toString();
			}

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
//						console.log("Parameters " + parameters);
						for (parameterName in parameters) {
//							console.log(
//									"Endpoint " + endpointURI +
//									" has parameter '" + parameterName +
//									"' with value '" + parameters[parameterName] + "'");
//							console.log(
//									"and (" + endpointURI + ").getParameter(" + parameterName + ") = '" +
//									endpoint.getParameter(parameterName) + "'");
							if (parameterName == "@type")
								graphWriter.addTriple(endpointURI, rdf("type"), parameters[parameterName]);
							else if (parameterName == "dcterms:identifier")
								graphWriter.addTriple(endpointURI, dcterms("identifier"), parameters[parameterName]);
							else if (parameterName == "dcterms:title")
								graphWriter.addTriple(endpointURI, dcterms("title"), parameters[parameterName]);
							else if (parameterName == "graphic:color_named")
								graphWriter.addTriple(endpointURI, graphic("color_named"), parameters[parameterName]);
							else if (parameterName == "graphic:shape_named")
								graphWriter.addTriple(endpointURI, graphic("shape_named"), parameters[parameterName]);
							else if (parameterName != "@id")
								graphWriter.addTriple(endpointURI, parameterName, parameters[parameterName]);
						}
					}
				}
			}
			
			function fromObject(object, contextURI, graphWriter/*, callback*/) {
				var objectURI = contextURI + "/" + getId(object);
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
//				if (object.getLabel)
//					console.log("Label: " + object.getLabel());
				if (object.toRDF)
					object.toRDF(objectURI, graphWriter);
				return objectURI;
			}
			
			function fromWorlkflowComponent(component, dataflowURI, graphWriter) {
				// may have a dcterms:title
				var componentURI = fromObject(component, dataflowURI,graphWriter);
				graphWriter.addTriple(componentURI, rdf("type"), mecomp("WorkflowComponent"));
				graphWriter.addTriple(dataflowURI, mecomp("has-component"), componentURI);
				graphWriter.addTriple(componentURI, mecomp("belongs-to-workflow"), dataflowURI);
				graphWriter.addTriple(dataflowURI, calli("hasComponent"), componentURI);
				return componentURI;
			}
			
			function fromNodeComponent(component, dataflowURI, graphWriter) {
//				console.log("Scanning component " + component);
//				console.log("Content: " + JSON.stringify(component));
				var componentURI = fromWorlkflowComponent(component, dataflowURI, graphWriter);
				graphWriter.addTriple(componentURI, rdf("type"), mecomp("NodeComponent"));
				var componentElement = component.getElement();
				var endpointList = jspInstance.getEndpoints(componentElement);
				if (endpointList) {
					for (var epIndex = 0; epIndex < endpointList.length; epIndex++) {
						fromEndpoint(endpointList[epIndex], componentURI, dataflowURI, graphWriter);
					}
				}
//				console.log("Component " + componentElement + " scanned");
				return componentURI;
			}
			
			function fromEndpoint(endpoint, componentURI, dataflowURI, graphWriter) {
//				console.log("Scanning endpoint " + endpoint);
				var endpointURI = fromWorlkflowComponent(endpoint, dataflowURI, graphWriter);
				graphWriter.addTriple(endpointURI, rdf("type"), mecomp("IOComponent"));
				graphWriter.addTriple(endpointURI, mecomp("for-component"), componentURI);
				parametersAsRDF(endpoint, endpointURI, graphWriter);
				for (var connectionIndex = 0; connectionIndex < endpoint.connections.length; connectionIndex++) {
					var connection = endpoint.connections[connectionIndex];
					var connectionURI = getId(connection);
					if (endpoint.isInputEndpoint()) {
						graphWriter.addTriple(connectionURI, mecomp("to-input"), endpointURI);
					}
					if (endpoint.isOutputEndpoint()) {
						graphWriter.addTriple(connectionURI, mecomp("from-output"), endpointURI);
					}
				}
//				graphWriter.addTriple(connectionURI,  dcterms("title"), title);
				// TODO: write endpoint data
				// TODO: return endpoint URI
//				console.log("Endpoint " + endpoint + " scanned");
			}
			
			function fromConnection(connection, dataflowURI, graphWriter) {
//				console.log("Scanning connection " + connection);
				var connectionURI = fromWorlkflowComponent(connection, dataflowURI, graphWriter);
				graphWriter.addTriple(connectionURI, rdf("type"), mecomp("Link"));
//				console.log("Connection " + connection + " scanned");
			}
			
			// may produce  dcterms:identifier for the dataflow
			
			if (!dataflowURI) dataflowURI = "";
			graphWriter.addTriple(dataflowURI, rdf("type"), mecomp("Dataflow"));
			if (componentList) {
				for (var compIndex = 0; compIndex < componentList.length; compIndex++) {
					fromNodeComponent(componentList[compIndex], dataflowURI, graphWriter);
				}
			}
			var connectionList = jspInstance.getConnections();
			if (connectionList) {
				for (var connIndex = 0; connIndex < connectionList.length; connIndex++) {
					fromConnection(connectionList[connIndex], dataflowURI, graphWriter);
				}
			}
			graphWriter.end();
		},

		jsPlumbFromRDF: function (graph, dataflowURI, jspInstance, objectFactory) {
	
			var objectIdCount = 0;
			var componentList = [];
			var objectFromURIs = {};
			
			var innerObjectFactory = {
					generatorFor: function(typeURI) {
						switch (typeURI) {
//						case mecomp("NodeComponent"):
//							return function() {};
//						case mecomp("IOComponent"):
//							return function() {};
						default:
							return null;
						}
					} 
			};
			
			function toTypedObject(objectURI, objectTypeURI, container) {
				var generator = null;
				if (objectFactory)
					generator = objectFactory.generatorFor(objectTypeURI);
				if (!generator && innerObjectFactory)
					generator = innerObjectFactory.generatorFor(objectTypeURI);
				var newObject = null;
				if (generator)
					newObject = generator(graph, objectURI, container);
				return newObject;
			}
			
			function toObject(objectURI, container) {
				var typeTriples = graph.find(objectURI, rdf("type"), null);
				for (var typeIndex = 0; typeIndex < typeTriples.length; typeIndex++) {
					var newObject = toTypedObject(objectURI, typeTriples[typeIndex].object, container);
					if (newObject) {
						objectFromURIs[objectURI] = newObject;
						return newObject;
					}
				}
				return null;
			}
			
			var toEndpoint = function(endpointURI, nodeComponent) {
//				console.log("Building endpoint " + endpointURI);
				var newEndpoint = toObject(endpointURI, nodeComponent);
//				console.log("Endpoint " + endpointURI + " built");
			}
			
			var toNodeComponent = function(componentURI) {
//				console.log("Building component " + componentURI);
//				console.log("Content: " + JSON.stringify(component));
				var newNodeComponent = toObject(componentURI);
				
				var endpointURIs = graph.find(null, mecomp("for-component"), componentURI);
				if (endpointURIs) {
					for (var epIndex = 0; epIndex < endpointURIs.length; epIndex++) {
						toEndpoint(endpointURIs[epIndex].subject, newNodeComponent);
					}
				}
//				console.log("Component " + componentURI + " built");
				return newNodeComponent;
			}
			
			function toConnection(connectionURI) {
				var targetURI = graph.find(connectionURI, mecomp("to-input"), null)[0].object;
				var sourceURI = graph.find(connectionURI, mecomp("from-output"), null)[0].object;

				jsPlumb.connect({
					source: objectFromURIs[sourceURI],
					target: objectFromURIs[targetURI]
				});
			}
			
			if (!dataflowURI) dataflowURI = "#";
			jspInstance.deleteEveryEndpoint(); // reset the jspPlumb instance without removing listeners
			var componentTriples = graph.find(dataflowURI, mecomp("has-component"), null);
			if (componentTriples) {
				for (var compIndex = 0; compIndex < componentTriples.length; compIndex++) {
					var componentURI = componentTriples[compIndex].object;
					if ( graph.find(componentURI, rdf("type"), mecomp("NodeComponent")).length > 0 )
							toNodeComponent(componentURI);
				}
				for (var compIndex = 0; compIndex < componentTriples.length; compIndex++) {
					var componentURI = componentTriples[compIndex].object;
					if ( graph.find( componentURI, rdf("type"), mecomp("Link") ).length > 0 )
							toConnection(componentURI);
				}
			}
		}
	}

}());

