/*In questo script si gestiscono i metodi della libreria jsPlumb per gestire i collegamenti tra i componenti*/

var Endpoint = {};

Endpoint.createEndpoint = function(div,componentObject,info){	
	var component = componentObject.Component;
	
	//Setting up drop options
	var targetDropOptions = {
		tolerance:'touch',
		hoverClass:'dropHover',
		activeClass:'dragActive'
	};
		
	if(info == null){ 
		//Setting up a Source endPoint
		var sourceEndpoint = {
			endpoint:["Dot", { radius:7 }],
			paintStyle:{strokeStyle:"black",fillStyle:"#CCCCCC"},
			connectorStyle:{ strokeStyle:"#CCCCCC", lineWidth:4 },
			maxConnections:100,
			isSource:true,
			connectorOverlays:[
				"Arrow"
//				[ "Label", { cssClass:"label", label:"",location:0.3, id:"lbl", events:{
//					"click":function(label,event) { 
//						Core.preventDefault(event);
//					
//						var parameter = label.component.getParameters();
//						jsPlumb.detach(label.component);
//						
//						/*Taglio connessioni quando i componenti sono target*/
//						if(Component.getComponent(parameter.codeTarget) == "output"){
//							var inputOut = Component.getVett(parameter.codeTarget);
//							InputType.eliminaInput(inputOut,parameter.codeSource);
//							Code.modificaCodice(parameter.codeTarget);
//						}
//						if(Component.getComponent(parameter.codeTarget) == "outputdefault"){
//							var inputDef = Component.getVett(parameter.codeTarget);
//							InputType.eliminaInput(inputDef,parameter.codeSource);
//							Code.modificaCodice(1);
//						}
//						if(Component.getComponent(parameter.codeTarget) == "construct"){
//							var inputConstr = Component.getVett(parameter.codeTarget);
//							InputType.eliminaCode(inputConstr,parameter.codeSource);
//							Code.modificaCodice(parameter.codeTarget);
//						}
//						if(Component.getComponent(parameter.codeTarget) == "updatable"){
//							var inputUpdat = Component.getVett(parameter.codeTarget);
//							InputType.eliminaCode(inputUpdat,parameter.codeSource);
//							Code.modificaCodice(parameter.codeTarget);
//						}
//						if(Component.getComponent(parameter.codeTarget) == "union"){
//							var inputUnion = Component.getVett(parameter.codeTarget);
//							InputType.eliminaInput(inputUnion,parameter.codeSource);
//							Code.modificaCodice(parameter.codeTarget);
//						}		
//					}}}]
				],
				parameters:{
					"source":componentObject
				}
			};
			
			//Setting up a Target endPoint
			var targetEndpoint = {
				endpoint:["Dot", { radius:7 }],
				paintStyle:{ strokeStyle:"black",fillStyle:"#CCCCCC"},
				connectorStyle:{ strokeStyle:"#CCCCCC", lineWidth:4 },
				maxConnections:100,
				isTarget:true,
				dropOptions:targetDropOptions,
				parameters:{
					"target":componentObject
				}	
			};
			
			jsPlumb.Defaults.HoverPaintStyle = { strokeStyle: "#FF3300" };
			
			if(component == "input" || component == "dataset" || component == "inputdefault"){
				jsPlumb.addEndpoint(div, { anchor:"BottomCenter"}, sourceEndpoint);
//				jsPlumb.addEndpoint(div, { anchor:[ 0.5, 1, 0, -1 ]}, sourceEndpoint);
			}
			
			if(component == "output" || component == "outputdefault" ){
				jsPlumb.addEndpoint(div,{ anchor:"TopCenter" },targetEndpoint);
			}
				
			if(component == "union"){
//				jsPlumb.addEndpoint(div, { anchor:[0.75, 0, 0, -1] }, targetEndpoint);
//				jsPlumb.addEndpoint(div, { anchor:[0.65, 0, 0, -1] }, targetEndpoint);
//				jsPlumb.addEndpoint(div, { anchor:[0.55, 0, 0, -1] }, targetEndpoint);
//				jsPlumb.addEndpoint(div, { anchor:[0.45, 0, 0, -1] }, targetEndpoint);
//				jsPlumb.addEndpoint(div, { anchor:[0.35, 0, 0, -1] }, targetEndpoint);
//				jsPlumb.addEndpoint(div, { anchor:[0.25, 0, 0, -1] }, targetEndpoint);	
				for (var i = 0; i < 6; i++) {
					jsPlumb.addEndpoint(div, { anchor:["Continuous", { faces:["top"] } ] }, targetEndpoint);
				}
				
				jsPlumb.addEndpoint(div, { anchor:"BottomCenter" }, sourceEndpoint);
			}
		
			if(component == "construct"){jsPlumb.addEndpoint(div, { anchor:"BottomCenter" }, sourceEndpoint);}
		
			if(component == "updatable"){jsPlumb.addEndpoint(div, { anchor:"BottomCenter" }, sourceEndpoint);}
		}
		else{	
			var inputVett = componentObject.InputList;
			
			var endpoints = jsPlumb.getEndpoints(div);
			
			var inputAr = $.grep(endpoints, function (elementOfArray, indexInArray){return elementOfArray.isTarget;});
			
			var temp = 0;	
			if(inputAr.length != 0){
				for(var i=0;i<inputAr.length;i++){
					if(!inputAr[i].isFull()){jsPlumb.deleteEndpoint(inputAr[i]);}
				}
			}
			
			var i=0;	
			while(i<inputVett.length){
				if(inputVett[i].ConnectedComponentCode != null && info == 1){i++;}
				else{
					var shape = inputVett[i].Shape;
					var color = inputVett[i].Color;
					var name = inputVett[i].Name;
				
					var targetEndpoint = {
						endpoint:[shape, { radius:7, width:14, height:14 }],
						paintStyle:{ strokeStyle:"black",fillStyle:color},
						maxConnections:100,
						isTarget:true,				
						dropOptions:targetDropOptions,
						anchor:["Continuous", { faces:["top"] } ],
						overlays:[
							["Label",{cssClass:"tooltip", label:name, id:"lab"}]
						],
						parameters:{
							"target":componentObject
						}	
					};
				
					jsPlumb.Defaults.HoverPaintStyle = { strokeStyle: "#FF3300" };
				
				
					if(info == 1 || info == 2){
						if(component == "construct"){
							var eConstr = jsPlumb.addEndpoint(div,targetEndpoint);
							Endpoint.fixEndpoint(div);
							Endpoint.eventLabel(eConstr);
						}
						if(component == "updatable"){
							var eUpdat = jsPlumb.addEndpoint(div,targetEndpoint);
							Endpoint.fixEndpoint(div);
							Endpoint.eventLabel(eUpdat);
						}
					}
					i++;
				}
			}//fine for
		}//fine else	
		
		jsPlumb.bind("connection",function(info){
				var connection = info.connection;
				var parameter = connection.getParameters();
				
				/*** Collegamenti non possibili ***/ 
//				if(info.sourceId == info.targetId ){
//					jsPlumb.detach(connection);
//				}
			
				var inputList = parameter.target.InputList;
				var label = info.targetEndpoint.getOverlays();
				if (parameter.target.Component == "construct" || parameter.target.Component == "updatable") {
					InputType.addSource(label[0].getLabel(),parameter.source.Code,inputList);
				} else {
					InputType.inizializzaInput(inputList,parameter.source.Code);
				}
				Code.modificaCodice(parameter.target.Code);

			});
			
			jsPlumb.bind("connectionDetached",function(info){
			
				var connection = info.connection;
				var parameter = connection.getParameters();
				
				var connections = jsPlumb.getConnections(div);	
			});
			jsPlumb.repaint(div);
			jsPlumb.draggable(div);
};

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
