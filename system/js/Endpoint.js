/*In questo script si gestiscono i metodi della libreria jsPlumb per gestire i collegamenti tra i componenti*/

var Endpoint = {};

var mecomp = function (localName) {
	return "http://rdf.myexperiment.org/ontologies/components/" + localName;
}

var swowscomp = function (localName) {
	return "http://swows.org/components/" + localName;
}

var rdf = function (localName) {
	return "http://www.w3.org/1999/02/22-rdf-syntax-ns#" + localName;
}

var graphic = function (localName) {
	return "http://purl.org/viso/graphic/" + localName;
}


var capitalize = function(s) {
    return s[0].toUpperCase() + s.slice(1);
}

Endpoint.createOutputEndpoint = function(componentObject) {	
	
	jsPlumb.Defaults.HoverPaintStyle = { strokeStyle: "#FF3300" };
	
	var newEndpoint =
		jsPlumb.addEndpoint(
			componentObject.getElement(),
			{
				endpoint:["Dot", { radius:7 }],
				paintStyle:{strokeStyle:"black",fillStyle:"#CCCCCC"},
				connectorStyle:{ strokeStyle:"#CCCCCC", lineWidth:4 },
				maxConnections:100,
				isSource:true,
				anchor: "BottomCenter",
				connectorOverlays:[	"Arrow"	]
			});

	return newEndpoint;
}

Endpoint.createInputEndpoint = function(componentObject, identifier, name, color, shape, inDefault) {	
	
	if (!identifier) {
		identifier = "default";
		inDefault = true;
	}
	if (!name)
		name = "default";
	if (!color)
		color = "#CCCCCC";
	if (!shape)
		shape = "Dot";
	if (!inDefault)
		inDefault = false;
	
	jsPlumb.Defaults.HoverPaintStyle = { strokeStyle: "#FF3300" };
	
	//Setting up drop options
	var targetDropOptions = {
		tolerance:'touch',
		hoverClass:'dropHover',
		activeClass:'dragActive'
	};

	var endpointFromShape = function (shape) {
		return [shape, { radius:7, width:14, height:14 }];
	}
	var paintStyleFromColor = function (color) {
		return { strokeStyle:"black",fillStyle:color };
	}
	var newEndpoint =
		jsPlumb.addEndpoint(
			componentObject.getElement(),
			{
				endpoint: endpointFromShape(shape),
				paintStyle: paintStyleFromColor(color),
				maxConnections:100,
				isTarget:true,				
				dropOptions:targetDropOptions,
				anchor:["Continuous", { faces:["top"] } ],
				overlays:[
					["Label",{cssClass:"tooltip", label:name, id:"lab"}]
				]
			});
	newEndpoint.meta = {
			"identifier": identifier,
			"name": name,
			"inDefault": inDefault,
			"shape": shape,
			"color": color
	};
	newEndpoint.toRDF = function (endpointURI, graphWriter) {
		graphWriter.addTriple(endpointURI, dcterms("identifier"), '"' + this.getIdentifier() + '"');
		graphWriter.addTriple(endpointURI, dcterms("title"), '"' + this.getName() + '"');
		graphWriter.addTriple(endpointURI, graphic("shape_named"), graphic(this.getShape()));
		graphWriter.addTriple(endpointURI, graphic("color_named"), graphic(capitalize(this.getColor())));
		graphWriter.addTriple(endpointURI, rdf("type"), mecomp("Input"));
		if (this.getInDefault())
			graphWriter.addTriple(componentURI, rdf("type"), swowscomp("isInDefaultInput"));
	};
	newEndpoint.getIdentifier = function () {
		return this.meta.identifier;
	};
	newEndpoint.setIdentifier = function (identifier) {
		return this.meta.identifier = identifier;
	};
	newEndpoint.getName = function () {
		return this.meta.name;
	};
	newEndpoint.setName = function (name) {
		return this.meta.name = name;
	};
	newEndpoint.getInDefault = function () {
		return this.meta.inDefault;
	};
	newEndpoint.setInDefault = function (inDefault) {
		return this.meta.inDefault = inDefault;
	};
	newEndpoint.getShape = function () {
		return this.meta.shape;
//		if (this instanceof Endpoints.Dot)
//			return "Dot";
//		if (this instanceof Endpoints.Rectangle)
//			return "Rectangle";
//		if (this instanceof Endpoints.Image)
//			return "Image";
//		if (this instanceof Endpoints.Blank)
//			return "Blank";
//		return null;
	};
	newEndpoint.setShape = function (shape) {
		this.setEndpoint(endpointFromShape(shape)); 
		this.meta.shape = shape;
	};
	newEndpoint.getColor = function () {
		return this.meta.color;
	};
	newEndpoint.setColor = function (color) {
		this.setPaintStyle(paintStyleFromColor(color));
		this.meta.color = color;
	};
	return newEndpoint;
}

Endpoint.inputFromRDF = function(graph, endpointURI, componentObject) {
	var propLiteralValue = function(graph, subjectURI, propertyURI) {
		var objects = graph.find(subjectURI, propertyURI, null);
		if (objects && N3.Util.isLiteral(objects[0]))
			return N3.getLiteralValue(objects[0]);
		return null;
	}
	
	var identifier = propLiteralValue(graph, endpointURI, dcterms("identifier"));
	var name = propLiteralValue(graph, componentURI, dcterms("title"));
	var shape = propLiteralValue(graph, componentURI, graphic("shape_named"));
	var color = propLiteralValue(graph, componentURI, graphic("color_named"));
	var inDefault = graph.find(endpointURI, rdf("type"), swowscomp("isInDefaultInput")).length > 0;
	Endpoint.createInputEndpoint(componentObject, identifier, name, color, shape, inDefault);
}

Endpoint.outputFromRDF = function(graph, endpointURI, componentObject) {
	Endpoint.createOutputEndpoint(componentObject);
}

Endpoint.createDefaultEndpoints = function(componentObject) {	
	var componentType = componentObject.Component;
	if(componentType == "input" || componentType == "dataset" || componentType == "inputdefault") {
		Endpoint.createOutputEndpoint(componentObject);
	}
	
	if(componentType == "output" || componentType == "outputdefault" ) {
		Endpoint.createInputEndpoint(componentObject);
	}
		
	if(componentType == "union") {
		for (var i = 0; i < 6; i++) {
			Endpoint.createInputEndpoint(componentObject);
		}
		Endpoint.createOutputEndpoint(componentObject);
	}

	if(componentType == "construct") {
		Endpoint.createOutputEndpoint(componentObject);
	}

	if(componentType == "updatable") {
		Endpoint.createOutputEndpoint(componentObject);
	}
};

//Endpoint.createEndpoint = function(div,componentObject,info){	
//	var componentType = componentObject.Component;
//		
//	if(info == null){ 
//		
//			if(componentType == "input" || componentType == "dataset" || componentType == "inputdefault") {
//				Endpoint.createOutputEndpoint(componentObject);
//			}
//			
//			if(component == "output" || component == "outputdefault" ) {
//				Endpoint.createInputEndpoint(componentObject);
//			}
//				
//			if(component == "union") {
//				for (var i = 0; i < 6; i++) {
//					Endpoint.createInputEndpoint(componentObject);
//				}
//				Endpoint.createOutputEndpoint(componentObject);
//			}
//		
//			if(component == "construct") {
//				Endpoint.createOutputEndpoint(componentObject);
//			}
//		
//			if(component == "updatable") {
//				Endpoint.createOutputEndpoint(componentObject);
//			}
//		}
//		else{	
//			var inputVett = componentObject.InputList;
//			
//			var endpoints = jsPlumb.getEndpoints(div);
//			
//			var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray){return elementOfArray.isTarget;});
//			
//			var temp = 0;	
//			if(inputAr.length != 0){
//				for(var i=0;i<inputAr.length;i++){
//					if(!inputAr[i].isFull()){jsPlumb.deleteEndpoint(inputAr[i]);}
//				}
//			}
//			
//			var i=0;	
//			while(i<inputVett.length){
//				if(inputVett[i].ConnectedComponentCode != null && info == 1){i++;}
//				else{
//					var shape = inputVett[i].Shape;
//					var color = inputVett[i].Color;
//					var name = inputVett[i].Name;
//				
//					var targetEndpoint = {
//						endpoint:[shape, { radius:7, width:14, height:14 }],
//						paintStyle:{ strokeStyle:"black",fillStyle:color},
//						maxConnections:100,
//						isTarget:true,				
//						dropOptions:targetDropOptions,
//						anchor:["Continuous", { faces:["top"] } ],
//						overlays:[
//							["Label",{cssClass:"tooltip", label:name, id:"lab"}]
//						]
////						parameters: {
//////							"@id": componentObject.ID + "/" + inputVett[i].Id,
////							"dcterms:title": name,
////							"dcterms:identifier": inputVett[i].Id,
////							"@type": ([ mecomp("Input") ]).concat(inputVett[i].InDefault ? [ "@type": swowscomp("isInDefaultInput") ] : [] ),
////							"graphic:shape_named": graphic(shape),
////							"graphic:color_named": graphic(capitalize(color))
////						}
//					};
//					
//				
//					jsPlumb.Defaults.HoverPaintStyle = { strokeStyle: "#FF3300" };
//				
//				
//					if ((info == 1 || info == 2) && (component == "construct" || component == "updatable")) {
//						var newEndpoint = jsPlumb.addEndpoint(div,targetEndpoint);
//						Endpoint.fixEndpoint(div);
//						newEndpoint.toRDF = function (endpointURI, graphWriter) {
//							graphWriter.addTriple(componentURI, dcterms("identifier"), '"' + inputVett[i].Id + '"');
//							graphWriter.addTriple(componentURI, dcterms("title"), '"' + inputVett[i].Name + '"');
//							graphWriter.addTriple(componentURI, graphic("shape_named"), graphic(inputVett[i].Shape));
//							graphWriter.addTriple(componentURI, graphic("color_named"), graphic(capitalize(inputVett[i].Color)));
//							graphWriter.addTriple(componentURI, rdf("type"), mecomp("Input"));
//							if (inputVett[i].InDefault)
//								graphWriter.addTriple(componentURI, rdf("type"), swowscomp("isInDefaultInput"));
//						};
//						Endpoint.eventLabel(newEndpoint);
//					}
//					i++;
//				}
//			}//fine for
//		}//fine else	
//		
//		jsPlumb.bind("connection",function(info){
//				var connection = info.connection;
//				var parameter = connection.getParameters();
//				
//				/*** Collegamenti non possibili ***/ 
////				if(info.sourceId == info.targetId ){
////					jsPlumb.detach(connection);
////				}
//			
//				var inputList = parameter.target.InputList;
//				var label = info.targetEndpoint.getOverlays();
//				if (parameter.target.Component == "construct" || parameter.target.Component == "updatable") {
//					InputType.addSource(label[0].getLabel(),parameter.source.Code,inputList);
//				} else {
//					InputType.inizializzaInput(inputList,parameter.source.Code);
//				}
//				Code.modificaCodice(parameter.target.Code);
//
//			});
//			
//			jsPlumb.bind("connectionDetached",function(info){
//			
//				var connection = info.connection;
//				var parameter = connection.getParameters();
//				
//				var connections = jsPlumb.getConnections(div);	
//			});
//			jsPlumb.repaint(div);
//			jsPlumb.draggable(div);
//};

/*Prende il vettore degli endpoint target*/
Endpoint.fixEndpoint = function(div){
	var endpoints = jsPlumb.getEndpoints(div);
	
	var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray){
		return elementOfArray.isTarget; 
	});
	
	Endpoint.calculateEndpoint(inputAr);
	jsPlumb.repaintEverything();
};

/*Posiziona gli endpoint*/
Endpoint.calculateEndpoint = function(endpointArray) {
	
	var mult = 1 / (endpointArray.length+1);
	
	for (var i = 0; i < endpointArray.length; i++){
		endpointArray[i].anchor.x = mult * (i + 1);
        endpointArray[i].anchor.y = 0;
	}
};

/*Elimina gli endpoint corrispondenti alla riga eliminata nella tabella degli input*/
Endpoint.eliminaEndpointTable = function(parent,name){
	var endpoints = jsPlumb.getEndpoints(parent);
	
	var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray){
		return elementOfArray.isTarget; 
	});
	
	for(var i=0;i<inputAr.length;i++){
		if(inputAr[i].getOverlay("lab").getLabel() == name){
			jsPlumb.deleteEndpoint(inputAr[i]);
		}
	}
};

Endpoint.verificaConnessione = function(endpoint,div){
	var endpoints = jsPlumb.getEndpoints(div);
	
	var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray){
		return elementOfArray.isTarget; 
	});
	
	for(var i=0;i<inputAr.length;i++){
		if(inputAr[i].getOverlay("lab").getLabel() == endpoint.Name){
			return inputAr[i].isFull();
		}
	}
};

/*Assegna eventi ad ongi endpoint creato nei componenti Construct e Updatable*/
Endpoint.eventLabel= function(endpoint){	
	endpoint.bind("mouseenter",function(){endpoint.showOverlay("lab");});
	endpoint.bind("mouseexit",function(){endpoint.hideOverlay("lab");});
};

/*Ricrea le connessioni quando si clicca il pulsnate Load Pipeline*/
Endpoint.connectEndpoint = function(dest,inputVett){
	var divlist = Core.getElementsByClass("activegraph");
	
	var shape = "Dot";
	var color = "#CCCCCC"
	var name = "";
	
	for(var i=0;i<inputVett.length;i++){
			
		if(Component.getComponent(dest.title) == "construct" || Component.getComponent(dest.title) == "updatable"){
			shape = inputVett[i].Shape;
			color = inputVett[i].Color;
			name = inputVett[i].Name;
		}
		var div = document.getElementById("comp-" + inputVett[i].ConnectedComponentCode);	
		
		var endpoints = jsPlumb.getEndpoints(dest);
	
		var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray){
			return elementOfArray.isTarget; 
		});
				
		var endout = jsPlumb.getEndpoints(div);
			
		var outputAr = $.grep(endout, function (elementOfArray, indexInArray){
			return elementOfArray.isSource; 
		});
		
//		console.log("Connecting endpoint " + outputAr[0] + " of " + div + " ("+ inputVett[i] + ") to endpoint " + inputAr[i] + " of " + dest);
		
		jsPlumb.connect({
			source:outputAr[0],
			target:inputAr[i],
		});
	}
};
