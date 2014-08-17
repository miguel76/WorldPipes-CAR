/*Ogni componente trascianto nella'erea editor è contenuto nel vettore dei Componenti.
Tale vettore è un array di classi.
In questo script si gestiscono tutti i metodi get e set per poter lavorare sul vettore dei Componenti*/
Component = {};

componentVett = []; 

var mecomp = function (localName) {
	return "http://rdf.myexperiment.org/ontologies/components/" + localName;
}

var swowscomp = function (localName) {
	return "http://swows.org/components/" + localName;
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

/*Costrutture della classe ComponentClass*/
function ComponentClass(CODE,COMPONENT,ID,URI,NAME,QUERY,INPUT,X,Y) {
	this.Code = CODE;
	this.Component = COMPONENT;
	this.ID = ID;
	this.URI = URI;
	this.Name = NAME;
	this.Query = QUERY;
	this.InputList = INPUT;
	this.X = X;
	this.Y = Y;
};

ComponentClass.prototype.setElement = function(element) { this.element = element; };

ComponentClass.prototype.getElement = function() { return this.element; };

ComponentClass.prototype.getEndpoints = function() { return jsPlumb.getEndpoints(this.element); };
ComponentClass.prototype.getInputEndpoints = function() {
	return _.filter(
			this.getEndpoints(),
			function(ep) { return ep.isInputEndpoint(); } );
};

ComponentClass.prototype.getId = function() { return this.ID; };

ComponentClass.prototype.allowsQuery = function() {
	return _.contains(["construct","updatable"],this.Component);
};

ComponentClass.prototype.allowsMultipleInputs = function() {
	return _.contains(["construct","updatable","pipeline"],this.Component);
};

ComponentClass.prototype.toRDF = function(componentURI, graphWriter) {
	
	var base = function(uriString) {
		var uri = URI(uriString);
		if (uri.is("absolute"))
			return uri.toString();
		else
			return uri.absoluteTo(componentURI).toString();
	}
	
	graphWriter.addTriple(componentURI, dcterms("identifier"), '"' + this.ID + '"');
	graphWriter.addTriple(componentURI, dcterms("title"), '"' + this.Name + '"');
	graphWriter.addTriple(componentURI, graphic("x_position"), '"' + this.X + '"^^<http://www.w3.org/2001/XMLSchema#float>');
	graphWriter.addTriple(componentURI, graphic("y_position"), '"' + this.Y + '"^^<http://www.w3.org/2001/XMLSchema#float>');
	var componentTypeName = this.Component;
	if (componentTypeName == "input") {
		graphWriter.addTriple(componentURI, rdf("type"), mecomp("Source"));
	} else if (componentTypeName == "output") {
		graphWriter.addTriple(componentURI, rdf("type"), mecomp("Sink"));
	} else {
		graphWriter.addTriple(componentURI, rdf("type"), mecomp("Processor"));
		if (componentTypeName == "dataset") {
			graphWriter.addTriple(componentURI, rdf("type"), mecomp("ConstantProcessor"));
			graphWriter.addTriple(componentURI, rdf("type"), swowscomp("URISourceProcessor"));
			graphWriter.addTriple(componentURI, mecomp("processor-value"), base(this.URI));
		} else if (componentTypeName == "pipes") {
			graphWriter.addTriple(componentURI, rdf("type"), mecomp("DataflowProcessor"));
//			graphWriter.addTriple(componentURI, rdf("type"), swowscomp("DataflowProcessor"));
		} else if (componentTypeName == "union") {
			graphWriter.addTriple(componentURI, rdf("type"), swowscomp("UnionProcessor"));
		} else if (componentTypeName == "construct") {
			graphWriter.addTriple(componentURI, rdf("type"), swowscomp("TransformProcessor"));
//			graphWriter.addTriple(componentURI, swowscomp("processor-transformation"), '"' + this.Query + '"');
			graphWriter.addTriple(componentURI, mecomp("processor-script"), '"' + this.Query + '"');
		} else if (componentTypeName == "updatable") {
			graphWriter.addTriple(componentURI, rdf("type"), swowscomp("Store"));
//			graphWriter.addTriple(componentURI, swowscomp("processor-transformation"), '"' + this.Query + '"');
			graphWriter.addTriple(componentURI, mecomp("processor-script"), '"' + this.Query + '"');
		}
	}
}

Component.factory = {
		generatorFor: function(objectType) {
			if (
					[mecomp("Source"),
					 mecomp("Sink"),
					 swowscomp("UnionProcessor"),
					 swowscomp("TransformProcessor"),
					 swowscomp("Store"),
					 swowscomp("URISourceProcessor"),
					 mecomp("DataflowProcessor")].indexOf(objectType) >= 0 )
				return Component.fromRDF;
			return null;
		}
}

Component.fromRDF = function(graph, componentURI) {
	
	var propLiteralValue = function(graph, subjectURI, propertyURI) {
		var triples = graph.find(subjectURI, propertyURI, null);
		if (triples && N3.Util.isLiteral(triples[0].object))
			return N3.Util.getLiteralValue(triples[0].object);
		return null;
	}
	
//	var propFloatValue = function(graph, subjectURI, propertyURI) {
//		var objects = graph.find(subjectURI, propertyURI, null);
//		if (objects && N3.Util.isLiteral(objects[0]))
//			return N3.getLiteralValue(objects[0]);
//		return null;
//	}
	
	var createComponentFromRDFType =
		function(
					componentType,
					identifier, title,
					x_position, y_position) {
//		function(code, componentTypeName, name, x, y) {
		cnt++;
		var code = cnt;
		switch (componentType) {
			case mecomp("Source"):
				return new ComponentClass(
						code,"input",title,"",title,null,null,
						x_position,y_position);
			case mecomp("Sink"):
				return new ComponentClass(
						code,"output","","",title,null,[],
						x_position,y_position);
			case swowscomp("UnionProcessor"):
				return new ComponentClass(
						code,"union",title,null,title,null,[],
						x_position,y_position);
			case swowscomp("TransformProcessor"):
				return new ComponentClass(
						code,"construct",title,null,title,"CONSTRUCT{?s ?p ?o}\nWHERE{?s ?p ?o}",[],
						x_position,y_position);
			case swowscomp("Store"):
				return new ComponentClass(
						code,"updatable",title,null,title,"",[],
						x_position,y_position);
			case swowscomp("URISourceProcessor"):
				return new ComponentClass(
						code,"dataset","","",title,null,null,
						x_position,y_position);
			case mecomp("DataflowProcessor"):
				return new ComponentClass(
						code,"pipes",title,null,title,null,[],
						x_position,y_position);
			default:
				return null;
		}
	};

	var identifier = propLiteralValue(graph, componentURI, dcterms("identifier"));
	var title = propLiteralValue(graph, componentURI, dcterms("title"));
	
	var x_position = propLiteralValue(graph, componentURI, graphic("x_position"));
	var y_position = propLiteralValue(graph, componentURI, graphic("y_position"));
	
	var editor = Core.getElementsByClass("areaeditor")[0];
	
	var componentTypes = graph.find(componentURI, rdf("type"), null);
	if (componentTypes) {
		for (var componentTypeIndex = 0; componentTypeIndex < componentTypes.length; componentTypeIndex++) { 
			var newComponent =
				createComponentFromRDFType(
						componentTypes[componentTypeIndex].object,
						identifier, title, x_position, y_position);
			if (newComponent) {
				Component.createGraphics(newComponent, editor);
				return newComponent;
			}
		}
	}
	return null;
	
}

Component.componentTypeNameToRDFClasses = function(componentURI, componentTypeName, graphWriter) {
};

Component.componentTypeNameFromId = function(componentTypeId) {
	switch (componentTypeId) {
	case "inputComp": return "input";
	case "outputComp": return "output";
	case "unionComp": return "union";
	case "constructComp": return "construct";
	case "updatableComp": return "updatable";
	case "datasetComp": return "dataset";
	case "pipesComp": return "pipes";
	return null;
	}
};

Component.isComponentPermanent = function(componentTypeName) {
	return false;
};

Component.getNewComponentName = function(componentTypeName) {
	if (Component.isComponentPermanent(componentTypeName))
		return componentTypeName;
	switch (componentTypeName) {
		case "input": return "Input" + cntIn++;
		case "output": return "Output" + cntOut++;
		case "union": return "Union" + cntUnion++;
		case "construct": return "Transform" + cntConstr++;
		case "updatable": return "Store" + cntUpdat++;
		case "dataset": return "File" + cntDataset++;
		case "pipes": return "Pipeline" + cntPipes++;
		default: return "???";
	}
};

Component.getPrototypeName = function(componentTypeName) {
	if (Component.isComponentPermanent(componentTypeName))
		return componentTypeName;
	switch (componentTypeName) {
		case "input": return "Input";
		case "output": return "Output";
		case "union": return "Union";
		case "construct": return "Transform";
		case "updatable": return "Store";
		case "dataset": return "File";
		case "pipes": return "Pipeline" + cntPipes++;
		default: return "???";
	}
};

Component.createComponentObject = function(code, componentTypeName, name, x, y) {
	switch (componentTypeName) {
		case "input":
			return new ComponentClass(code,componentTypeName,name,"",name,null,null,x,y);
		case "output":
			return new ComponentClass(code,componentTypeName,"","",name,null,[],x,y);
		case "union":
			return new ComponentClass(code,componentTypeName,name,null,name,null,[],x,y);
		case "construct":
			return new ComponentClass(code,componentTypeName,name,null,name,"CONSTRUCT{?s ?p ?o}\nWHERE{?s ?p ?o}",[],x,y);
		case "updatable":
			return new ComponentClass(code,componentTypeName,name,null,name,"",[],x,y);
		case "dataset":
			return new ComponentClass(code,componentTypeName,"","",name,null,null,x,y);
		case "pipes":
			return new ComponentClass(code,name,null,name,null,[]);
		default:
			return null;
	}
};

Component.createGraphics = function(componentObject, editor) {
	Component._loadPipeline(
			editor,
			componentObject.Code,
			componentObject.Component,
			componentObject.ID,
			componentObject.URI,
			componentObject.Name,
			componentObject.Query,
			componentObject.InputList,
			componentObject.X,
			componentObject.Y,
			componentObject);
//	alert("Component " + componentObject.Code + " created");
};

Component.createFromTypeId = function(componentTypeId, editor, clientX, clientY) {
	cnt++;
	var code = cnt;
	
	var componentTypeName = Component.componentTypeNameFromId(componentTypeId);
	var posX = clientX - editor.offsetLeft;// + "px";
	var posY = clientY - editor.offsetTop;// + "px";
	
	var name = Component.getNewComponentName(componentTypeName);
	var newComponent = Component.createComponentObject(code, componentTypeName, name, posX, posY);
	componentVett[componentVett.length] = newComponent;
	
//	Endpoint.createEndpoint(div,code,null);
	Code.writeCodeFromComponent(newComponent);
	//Component.cercaElem();
	Component.createGraphics(newComponent, editor);
	Endpoint.createDefaultEndpoints(newComponent);
//	jsPlumb.repaint(newComponent.getElement());
//	jsPlumb.draggable(newComponent.getElement());

	Code.updateCodeFromComponent(newComponent);
};

Component.prototypeFromTypeId = function(componentTypeId, parentElement, posX, posY) {
	var componentTypeName = Component.componentTypeNameFromId(componentTypeId);
	var name = Component.getPrototypeName(componentTypeName);
	var newComponent = Component.createComponentObject(0, componentTypeName, name, posX, posY);
	Component.createGraphics(newComponent, parentElement);
};

/*Restituisce il codice del componente*/
Component.getCode = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].Code;}
	}
};

/*Restituisce la categoria a cui il componente appartiene*/
Component.getComponent = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].Component;}
	}
};

/*Restitusce l'ID del componente*/
Component.getID = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){
			if(componentVett[i].ID != null){return componentVett[i].ID;}
			else{return null;}
		}
	}
};

/*Restituisce l'URI del componente*/
Component.getURI = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){
			if(componentVett[i].URI != null){return componentVett[i].URI;}
		}
	}
};

/*Restituisce il Nome del componente*/
Component.getName = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].Name;}
	}
};

/*Restitusce la query*/
Component.getQuery = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].Query;}
	}
};

/*Restitusce la posizione nell'asse X del compomente*/
Component.getX = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].X;}
	}
};

/*Restitusce la posizione nell'asse Y del compomente*/
Component.getY = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].Y;}
	}
};

/*Restitusce il vettore degli input connessi al componente*/
Component.getVett = function(code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){return componentVett[i].InputList;}
	}
};

/*Cerca un elemento nel vettore dei Componenti*/
Component.cercaElem = function(){
		for(var i=0;i<componentVett.length;i++){
			if(componentVett[i].ID){alert("componentVett[" + i + "]:" + componentVett[i].Code);}
			else{alert("componentVett[" + i + "]:" + componentVett[i].Code);}
			
		}
};

/*Aggiorna i dati di un componente*/
Component.modifica = function(code,ID,URI,NAME,QUERY,inputVett,X,Y){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){
//			if(componentVett[i].ID != null && componentVett[i].ID != ID){
//				componentVett[i].ID = ID;
//			}
			if(componentVett[i].URI != null && componentVett[i].URI != URI){
				componentVett[i].URI = URI;
			}
			if(componentVett[i].Name != null && componentVett[i].Name != NAME){
				componentVett[i].Name = NAME;
				componentVett[i].ID = encodeURIComponent(NAME);
//				alert(componentVett[i].ID);
			}
			if(componentVett[i].Query != null && componentVett[i].Query != QUERY){
				componentVett[i].Query = QUERY;
			}
			if(componentVett[i].InputList != null){
				if(componentVett[i].InputList.length != 0){
					/*Scorre in vettore degli input di componentVett*/
					for(var j=0;j<componentVett[i].InputList.length;j++){
//						componentVett[i].InputList[j].ConnectedComponentCode = inputVett[j].ConnectedComponentCode;
						componentVett[i].InputList[j].Id = inputVett[j].Id;
						componentVett[i].InputList[j].Name = inputVett[j].Name;
						componentVett[i].InputList[j].Shape = inputVett[j].Shape;
						componentVett[i].InputList[j].Color = inputVett[j].Color;						
						componentVett[i].InputList[j].InDefault = inputVett[j].InDefault;						
					}
				}
			}
			if(componentVett[i].X != null && componentVett[i].X != X){
				componentVett[i].X = X;
			}
			if(componentVett[i].Y != null && componentVett[i].Y != Y){
				componentVett[i].Y = Y;
			}
		}
	}
};

Component.impostaValori = function(code,inputVett){	
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){
			for(var j=0;j<inputVett.length;j++){
				if(inputVett[j].ConnectedComponentCode == code){
						componentVett[i].ID = inputVett[j].Id;
						componentVett[i].Name = inputVett[j].Name;
				}
			}
		}
	}
};

/*Elimina un componente dal vettore dei Componenti*/
Component.elimina = function(componentVett,code){
	for(var i=0;i<componentVett.length;i++){
		if(componentVett[i].Code == code){
			/*Cancella codice*/
			Code.cancellaCodice(code,false);
			/*Cancella elemento*/
			componentVett.splice(i,1);
			//alert("Component removed");
		}
	}
};

/*Scrive il nome del componente nel div*/
Component.scriviNome = function(div,code,cnt){
	var name = Component.getName(code);
	
	var label = document.createElement("label"); 
	label.setAttribute("class","activeimg");
	var br = document.createElement("br");
	
	if(code == 0 || code == 1){
		name = div.title;
		var text = document.createTextNode(name);
		label.appendChild(text);
		label.appendChild(br);
		label.appendChild(br);
		return label;
	}
	
	if(name == null){
		name = div.title + " " + cnt;
		var text = document.createTextNode(name);
		label.appendChild(text);
		label.appendChild(br);
		return label;
	}
	else{
		var text = document.createTextNode(name);
		label.appendChild(text);
		label.appendChild(br);
		return label;
	}	
};

/*Salva dati contenuti in componentVett*/
Component.refreshEditor = function(editor){
	/*var figli = editor.childNodes;
	for(var i=figli.length-1;i != 0; i--){
		if(figli[i].id != "edit"){editor.removeChild(figli[i]);}
	}*/
	if (jsPlumb.selectEndpoints().length > 0)
		jsPlumb.reset();
	var edit = document.getElementById("edit");
	editor.innerHTML = edit.outerHTML;
	
	for(var i=0;i<componentVett.length;i++){
		Code.cancellaCodice(componentVett[i].Code);
	}
};

/*Ricaricare Vettore dei componenti nella pagina web*/
Component.scorriVettore = function(editor,componentVett){
	for(var i=0;i<componentVett.length;i++){
		//alert("Code -  " + componentVett[i].Code + " Component -  " + componentVett[i].Component + " ID -  " +  componentVett[i].ID + " URI -  " + componentVett[i].URI + " Name -  " + componentVett[i].Name + " Query -  " + componentVett[i].Query + " InputList -  " + componentVett[i].InputList.length + " X -  " + componentVett[i].X + " Y -  " + componentVett[i].Y);
//		Component.loadPipeline(editor,componentVett[i].Code,componentVett[i].Component,componentVett[i].ID,componentVett[i].URI,componentVett[i].Name,componentVett[i].Query,componentVett[i].InputList,componentVett[i].X,componentVett[i].Y);
		Component.createGraphics(componentVett[i], editor);
	}
	Component.createConnection(editor);
};

Component._onlyValue = function(valueWithPx){
	var floatingValue = (valueWithPx.substr(valueWithPx.length-2) == "px")
							? valueWithPx.substr(0,valueWithPx.length-2)
							: valueWithPx;
	var pointIndex = floatingValue.search("\\.");
	alert(	"fv: '" + floatingValue +
			"', pi: " + pointIndex +
			", substr: '" +
				( (pointIndex != -1)
					? floatingValue.substr(0,pointIndex)
					: floatingValue ) + "'");
	alert(parseInt((pointIndex != -1)
			? floatingValue.substr(0,pointIndex)
					: floatingValue));
	return parseInt((pointIndex != -1)
				? floatingValue.substr(0,pointIndex)
				: floatingValue);
}

/*Update the current components positions in the component vector*/
Component.updatePositions = function(editor,componentVett){
	for(var i=0;i<componentVett.length;i++){
//		var compDiv = editor.getElementById("comp-" + i);
//		alert("comp-" + componentVett[i].Code);
		var compDiv = document.getElementById("comp-" + componentVett[i].Code);
//		componentVett[i].X = Component._onlyValue(compDiv.style.left);
//		componentVett[i].Y = Component._onlyValue(compDiv.style.top);
		componentVett[i].X = compDiv.offsetLeft;
		componentVett[i].Y = compDiv.offsetTop;
	}
};

//Component.getImageURI = function(component) {
//	if (component == "inputdefault" || component == "input")
//		return "IMG/components/Input_Comp.png";
//	if (component == "outputdefault" || component == "output")
//		return "IMG/components/Output_Comp.png";
//	if (component == "union")
//		return "IMG/compLogos-union.svg";
//	if (component == "construct")
//		return "IMG/components/Trapeze_Comp.png";
//	if (component == "updatable")
//		return "IMG/components/Database_Comp.png";
//	if (component == "dataset")
//		return "IMG/compLogos-fileSource.svg";
//	return null;
//}

/*Ricarica la pipeline creata*/
Component._loadPipeline = function(editor,code,component,id,uri,name,query,inputlist,x,y,componentObject){
	//alert(code + component + id + uri + name + query + inputlist + x + y);
	
	var div = document.createElement("div");
	div.setAttribute("class","activegraph component component_" + component);
	div.setAttribute("id","comp-" + code);
	div.title = code;
	
//	var img = document.createElement("img");
//	img.setAttribute("class","activeimg");
	
//	div.appendChild(img);
		
	var label = document.createElement("label"); 
	label.setAttribute("class","compLabel activeimg compLabel_" + component);
	var text = document.createTextNode(name);
	label.appendChild(text);
	
	div.appendChild(label);
	
//	var tr_2 = document.createElement("tr");
//	var td_2_1 = document.createElement("td");
//	td_2_1.setAttribute("colspan","2");
//	td_2_1.appendChild(label);
//	tr_2.appendChild(td_2_1);
//	table.appendChild(tr_2);
	
	if(component == "input" || component == "output" || component == "union" || component == "construct" || component == "updatable" || component == "dataset"){

		var buttonSet = document.createElement("div");
		buttonSet.setAttribute("class","compButtonSet compButtonSet_" + component);

		var proprieta = document.createElement("img");
		proprieta.setAttribute("class","bottongraph compButton compSettings compSettings_" + component);
		proprieta.src = "IMG/Settings.png";
		proprieta.title = "property";
		buttonSet.appendChild(proprieta);

		var elimina = document.createElement("img");
		elimina.setAttribute("class","bottongraph compButton compDelete compDelete_" + component);
		elimina.src = "IMG/Trash.png";
		elimina.title = "delete";
		buttonSet.appendChild(elimina);
		
		div.appendChild(buttonSet);
		
		Core.addEventListener(proprieta,"click",function(){
//			document.getElementById("dialogBackground").style.display = "";
//			var controller = angular.element(document.body).controller();
//			var injector = angular.element(document.body).injector();
			var scope = angular.element(document.body).scope();
			scope.$apply(function(scope) {scope.sel.openFor(componentObject);});
//			injector.invoke(function(rootScope) { rootScope.sel.component = this; }, componentObject);
//			angular.$rootScope.$eval(function(scope) {scope.sel.component = componentObject});
//			var settingsForm = Form.createForm(div,componentObject);
//			document.getElementById("dialogContainer").appendChild(settingsForm);
		});
					
		Core.addEventListener(elimina,"click",function(){
			if (confirm("Should I really delete this component?")) {
				jsPlumb.removeAllEndpoints(div);
				jsPlumb.detachAllConnections(div);
				div.parentNode.removeChild(div);
				Component.elimina(componentVett,code);
				Code.cancellaCodice(code);
			}
		});
		
//		table.appendChild(tr_2);

	}
	
	var x = div.style.left = x;
	var y = div.style.top = y;
	
	editor.appendChild(div);	
	
//	Endpoint.createEndpoint(div,componentObject,null);	
//	if((component == "construct" || component == "updatable") && inputlist.length != 0){Endpoint.createEndpoint(div,componentObject,2);}
	
	componentObject.element = div;
	jsPlumb.draggable(div);
//	componentObject.setElement(div);
//	Code.modificaCodice(code);
};

Component.createConnection = function(editor){
	var divlist = Core.getElementsByClass("activegraph");
	
	for(var i=0;i<divlist.length;i++){
		if(Component.getVett(divlist[i].title) != null){
			var inputVett = Component.getVett(divlist[i].title);
			Endpoint.connectEndpoint(divlist[i],inputVett);
		}
	}
};

Component.jsonLoad = function(){
	var editor = Core.getElementsByClass("areaeditor")[0];
	updateStatus(
			"Loading Pipeline...",
			function() {
				JsonToServer.loadPipelineData(URIGraphStore,PipelineMainURI,
						function(err,result){
					if(err != null){
						alert("Error!" + err);
						updateStatus("Error Loading Pipeline");
					} else {
						if (result && result.length > 0) {
//						alert(JSON.stringify(result));
							Component.refreshEditor(editor);	
							componentVett = result;					
							Component.scorriVettore(editor,componentVett);
							for(var i=0;i<componentVett.length;i++){
								if(componentVett[i].Code + 1 > cnt){
									cnt = componentVett[i].Code + 1;
								}
							}
						}
					}
					updateStatus("Pipeline Loaded!");
				});
			});
};
