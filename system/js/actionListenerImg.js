/*In questo script si gestiscono gli eventi scaturiti dall'azione del mouse.
Il click del mouse sui pulsanti New, Save e Play.
Il drag dei componenti.
Il drop dei componeti nell'area editor ossia la creazione del componente stesso.*/
var actionListenerImg =
{
	init:function(graphURIPrefix){
		cnt = 1;
		dragDrop = false;
		cntIn = 1; cntOut = 1; cntUnion = 1; cntConstr = 1; cntUpdat = 1; cntDataset = 1; cntPipes = 1;
		cntInDef = 0; cntOutDef = 1;
		
		var componentPrototypes = document.getElementsByClassName("componentPrototype");
		
		
//		actionListenerImg.creaInDefault(dropeditor[0]);
//		actionListenerImg.creaOutDefault(dropeditor[0]);
		
		for(var i=0;i<componentPrototypes.length;i++){
			componentPrototypes[i].setAttribute("draggable",true);
			componentPrototypes[i].addEventListener("dragstart",actionListenerImg.DragStart);
//			componentPrototypes[i].addEventListener("drag",actionListenerImg.Drag);
		}

		var dropeditor = document.getElementById("areaeditor");
		Core.addEventListener(dropeditor,"dragenter",actionListenerImg.DragEnter);
		Core.addEventListener(dropeditor,"dragleave",actionListenerImg.DragLeave);
		Core.addEventListener(dropeditor,"dragover",actionListenerImg.DragOver);
		Core.addEventListener(dropeditor,"drop",actionListenerImg.Drop);

	},
	
	/*Crea l'input di default*/
	creaInDefault: function(editor){
	
		/*** Input graph default ***/
		var indef = document.createElement("div");
		indef.setAttribute("class","activegraph");
		indef.title = "Default Input";
		indef.id = "comp-" + componentVett.length;
			
		var img = document.createElement("img");
		img.setAttribute("class","activeimg");
		var imgURI = Component.getImageURI("input");
		if (imgURI != null)
			img.src = imgURI;
		indef.appendChild(img);
			
		var label = Component.scriviNome(indef,cntInDef,cntInDef);
		indef.appendChild(label);
		
		var x = indef.style.left = 20;// + "px";
		var y = indef.style.top = 20;// + "px";
		
		editor.appendChild(indef);
		
		var name = indef.title;
		var newComponent = componentVett[componentVett.length] = new ComponentClass(cntInDef,"inputdefault","defaultInput",null,name,null,null,x,y);		
		Endpoint.createEndpoint(indef,newComponent,null);
		Code.writeCodeFromComponent(newComponent);
	},
	
	/*Crea l'output di default*/
	creaOutDefault: function(editor){
	
		/*** Output graph default ***/
		var outdef = document.createElement("div");
		outdef.setAttribute("class","activegraph");
		outdef.title = "Default Output";
		outdef.id = "comp-" + componentVett.length;
			
		var img = document.createElement("img");
		img.setAttribute("class","activeimg");
		var imgURI = Component.getImageURI("output");
		if (imgURI != null)
			img.src = imgURI;
		outdef.appendChild(img);
			
		var label = Component.scriviNome(outdef,cntOutDef,cntOutDef);
		outdef.appendChild(label);
		
		var x = outdef.style.left = 350;// + "px";
		var y = outdef.style.top = 350;// + "px";
		
		editor.appendChild(outdef);
		
		var inputOutDef = [];
		var name = outdef.title;
		var newComponent = componentVett[componentVett.length] = new ComponentClass(cntOutDef,"outputdefault","","",name,null,inputOutDef,x,y);
		Endpoint.createEndpoint(outdef,newComponent,null);
		Code.writeCodeFromComponent(newComponent);
	},
	
	
	/*MouseOver: function(event){
		actionListenerImg.MouseListenerOver(this);
		Core.preventDefault(event);
	},
	MouseOut: function(event){
		actionListenerImg.MouseListenerOut(this);
		Core.preventDefault(event);
	},*/
	
	MouseClick: function(event){
		actionListenerImg.MouseListenerClick(this);
		Core.preventDefault(event);
	},
	
	/* ***************************************** Drag & drop ***************************************** */
	
	DragStart: function(event){
		event.dataTransfer.setData("compId",this.id);
		event.dataTransfer.setData("offsetX",event.offsetX);
		event.dataTransfer.setData("offsetY",event.offsetY);
	},
	
	DragEnter: function(event){
		//Core.addClass(this,"attivo");
		event.stopPropagation();
	},
	
	DragLeave: function(event){
		//Core.removeClass(this,"attivo");
		event.stopPropagation();
	},
	
	DragOver: function(event){
		event.stopPropagation();
		Core.preventDefault(event);
	},
	/*Gestisce l'evento drop del mouse, quando un componente viene rilasciato nell'area editor questo vine creato e inseriro nel vettore dei Componneti*/
	Drop: function(event){
		Core.preventDefault(event); 
		//Core.removeClass(this,"attivo");
		
		var id = event.dataTransfer.getData("compId");
		var offsetX = event.dataTransfer.getData("offsetX");
		var offsetY = event.dataTransfer.getData("offsetY");
		var dropeditor = Core.getElementsByClass("areaeditor");
		Component.createFromTypeId(id, dropeditor[0], event.clientX - parseInt(offsetX), event.clientY - parseInt(offsetY));
	},
};

Core.start(actionListenerImg);
