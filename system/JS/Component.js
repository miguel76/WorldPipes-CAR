/*Ogni componente trascianto nella'erea editor è contenuto nel vettore dei Componenti.
Tale vettore è un array di classi.
In questo script si gestiscono tutti i metodi get e set per poter lavorare sul vettore dei Componenti*/
var Component = {};

componentVett = []; 

/*Costrutture della classe ComponentClass*/
var ComponentClass = function(CODE,COMPONENT,ID,URI,NAME,QUERY,INPUT,X,Y){
	this.Code = CODE;
	this.Component = COMPONENT
	this.ID = ID;
	this.URI = URI;
	this.Name = NAME;
	this.Query = QUERY;
	this.InputList = INPUT;
	this.X = X;
	this.Y = Y;
};

Component.componentTypeNameFromId(componentTypeId) {
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
}

Component.isComponentPermanent(componentTypeName) {
	switch (componentTypeName) {
	return false;
	}
}

//Component.numOfComponents = 0;

Component.getNewComponentName(componentTypeName) {
	if (Component.isComponentPermanent(componentTypeName))
		return componentTypeName;
	switch (componentTypeName) {
	case "input": return "Input " + cntIn++;
	case "output": return "Output " + cntOut++;
	case "union": return "Union " + cntUnion++;
	case "construct": return "Construct " + cntConstr++;
	case "updatable": return "Updatable " + cntUpdat++;
	case "dataset": return "Dataset " + cntDataset++;
	case "pipes": return "Pipeline " + cntPipes++;
	return "???";
	}
}

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
	return null;
	}
}

Component.createGraphics = function(componentObject, editor) {
	Component.loadPipeline(
			editor,
			componentObject.Code,
			componentObject.Component,
			componentObject.ID,
			componentObject.URI,
			componentObject.Name,
			componentObject.Query,
			componentObject.Inputlist,
			componentObject.X,
			componentObject.Y);
	Code.updateCodeFromComponent(componentObject);
}

Component.createFromTypeId = function(componentTypeId, editor) {
	cnt++;
	var code = cnt;
	
	var componentTypeName = Component.componentTypeNameFromId(componentTypeId);
	var x = event.clientX - this.offsetLeft;// + "px";
	var y = event.clientY - this.offsetTop;// + "px";
	
//	var div = document.createElement("div");
//	div.setAttribute("class","activegraph");
//	div.setAttribute("id","comp-" + code);
//	//div.title = "Input";
//	
//	var img = document.createElement("img");
//	img.setAttribute("class","activeimg");
//	var imgURI = Component.getImageURI(componentTypeName);
//	if (imgURI != null)
//		img.src = imgURI;
//	div.appendChild(img);
//	
//	var label = Component.scriviNome(div,code,cntIn);
//	div.appendChild(label);
//	
//	var proprieta = document.createElement("img");
//	proprieta.setAttribute("class","bottongraph");
//	proprieta.src = "IMG/pulsanteproprieta.gif";
//	proprieta.title = "Component Properties";
//	proprieta.class = "compProperties";
//	div.appendChild(proprieta);
//			
//	var elimina = document.createElement("img");
//	elimina.setAttribute("class","bottongraph");
//	elimina.src = "IMG/iconaX.gif";
//	elimina.title = "Delete Component";
//	proprieta.class = "compDelete";
//	div.appendChild(elimina);
//	
//	var x = div.style.left = event.clientX - this.offsetLeft;// + "px";
//	var y = div.style.top = event.clientY - this.offsetTop;// + "px";
//	
//	this.appendChild(div);
//	
//	Core.addEventListener(proprieta,"click",function(){
//		var body = document.createElement("div");
//		body.setAttribute("class","body");
//		formIN = Form.createForm(div,code);
//		document.getElementsByTagName("body")[0].appendChild(formIN);
//		document.getElementsByTagName("body")[0].appendChild(body);
//	});
//	
//	
//	Core.addEventListener(elimina,"click",function(){
//		if(confirm("Are you sure you want to delete this component?")){
//			temp = elimina.parentNode.parentNode;
//			jsPlumb.removeAllEndpoints(elimina.parentNode);
//			jsPlumb.detachAllConnections(elimina.parentNode);
//			temp.removeChild(elimina.parentNode);
//			Component.elimina(componentVett,code);
//			Code.cancellaCodice(code);	
//		}
//	});
	
	var name = Component.getNewComponentName(componentTypeName);
	var newComponent = Component.createComponentObject(code, componentTypeName, name, x, y);
	componentVett[componentVett.length] = newComponent;
	
//	Endpoint.createEndpoint(div,code,null);
	Code.writeCodeFromComponent(newComponent);
	//Component.cercaElem();
	Component.createGraphics(newComponent, editor);
}

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
				alert(componentVett[i].ID);
			}
			if(componentVett[i].Query != null && componentVett[i].Query != QUERY){
				componentVett[i].Query = QUERY;
			}
			if(componentVett[i].InputList != null){
				if(componentVett[i].InputList.length != 0){
					/*Scorre in vettore degli input di componentVett*/
					for(var j=0;j<componentVett[i].InputList.length;j++){
						componentVett[i].InputList[j].ConnectedComponentCode = inputVett[j].ConnectedComponentCode;
						componentVett[i].InputList[j].Id = inputVett[j].Id;
						componentVett[i].InputList[j].Name = inputVett[j].Name;
						componentVett[i].InputList[j].Shape = inputVett[j].Shape;
						componentVett[i].InputList[j].Color = inputVett[j].Color;						
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
		Component.loadPipeline(editor,componentVett[i].Code,componentVett[i].Component,componentVett[i].ID,componentVett[i].URI,componentVett[i].Name,componentVett[i].Query,componentVett[i].InputList,componentVett[i].X,componentVett[i].Y);
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

Component.getImageURI = function(component) {
	if (component == "inputdefault" || component == "input")
		return "IMG/compLogos-input.svg";
	if (component == "outputdefault" || component == "output")
		return "IMG/compLogos-output.svg";
	if (component == "union")
		return "IMG/compLogos-union.svg";
	if (component == "construct")
		return "IMG/compLogos-transform.svg";
	if (component == "updatable")
		return "IMG/compLogos-state.svg";
	if (component == "dataset")
		return "IMG/compLogos-fileSource.svg";
	return null;
}

/*Ricarica la pipeline creata*/
Component._loadPipeline = function(editor,code,component,id,uri,name,query,inputlist,x,y){
	//alert(code + component + id + uri + name + query + inputlist + x + y);
	
	var div = document.createElement("div");
	div.setAttribute("class","activegraph");
	div.setAttribute("id","comp-" + code);
	div.title = code;
	
	var img = document.createElement("img");
	img.setAttribute("class","activeimg");
	
	var imgURI = Component.getImageURI(component);
	if (imgURI != null)
		img.src = imgURI;
	
//	div.appendChild(img);
		
	var label = document.createElement("label"); 
	label.setAttribute("class","compLabel activeimg");
	var text = document.createTextNode(name);
	label.appendChild(text);
	
	var table = document.createElement("table");
	
	var tr_1 = document.createElement("tr");
	
	var td_1_1 = document.createElement("td");
	td_1_1.setAttribute("class","compImage");
	td_1_1.setAttribute("rowspan","2");
	td_1_1.appendChild(img);
	tr_1.appendChild(td_1_1);
	
	var td_1_2 = document.createElement("td");
	td_1_2.setAttribute("colspan","3");
	td_1_2.appendChild(label);
	tr_1.appendChild(td_1_2);

	table.appendChild(tr_1);
	
//	var tr_2 = document.createElement("tr");
//	var td_2_1 = document.createElement("td");
//	td_2_1.setAttribute("colspan","2");
//	td_2_1.appendChild(label);
//	tr_2.appendChild(td_2_1);
//	table.appendChild(tr_2);
	
	if(component == "input" || component == "output" || component == "union" || component == "construct" || component == "updatable" || component == "dataset"){

		var tr_2 = document.createElement("tr");
		var td_2_1 = document.createElement("td");
		td_2_1.appendChild(document.createTextNode(" "));
		tr_2.appendChild(td_2_1);

		var proprieta = document.createElement("img");
		proprieta.setAttribute("class","bottongraph");
		proprieta.src = "IMG/properties.png";
		proprieta.title = "property";

		var td_2_2 = document.createElement("td");
		td_2_2.appendChild(proprieta);
		tr_2.appendChild(td_2_2);
		
		Core.addEventListener(proprieta,"click",function(){
			var body = document.createElement("div");
			body.setAttribute("class","body");
			formIN = Form.createForm(div,code);
			document.getElementsByTagName("body")[0].appendChild(formIN);
			document.getElementsByTagName("body")[0].appendChild(body);
		});
					
		var elimina = document.createElement("img");
		elimina.setAttribute("class","bottongraph");
		elimina.src = "IMG/delete.png";
		elimina.title = "delete";
		div.appendChild(elimina);
		
		var td_2_3 = document.createElement("td");
		td_2_3.appendChild(elimina);
		tr_2.appendChild(td_2_3);

		Core.addEventListener(elimina,"click",function(){
			temp = elimina.parentNode.parentNode;
			jsPlumb.removeAllEndpoints(elimina.parentNode);
			jsPlumb.detachAllConnections(elimina.parentNode);
			temp.removeChild(elimina.parentNode);
			Component.elimina(componentVett,code);
			Code.cancellaCodice(code);	
		});
		
		table.appendChild(tr_2);

	}
	
	var x = div.style.left = x;
	var y = div.style.top = y;
	
	div.appendChild(table);
	editor.appendChild(div);	
	
	Endpoint.createEndpoint(div,code,null);	
	
	if((component == "construct" || component == "updatable") && inputlist.length != 0){Endpoint.createEndpoint(div,code,2);}
	
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
