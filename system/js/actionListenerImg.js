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
		
		var img = document.getElementsByTagName("img");
		var dropeditor = Core.getElementsByClass("areaeditor");
		
		actionListenerImg.creaInDefault(dropeditor[0]);
		actionListenerImg.creaOutDefault(dropeditor[0]);
		
		for(i=0;i<img.length;i++){
			//Core.addEventListener(img[i],"mouseover",actionListenerImg.MouseOver);
			//Core.addEventListener(img[i],"mouseout",actionListenerImg.MouseOut);
			Core.addEventListener(img[i],"click",actionListenerImg.MouseClick);
			Core.addEventListener(img[i],"dragstart",actionListenerImg.DragStart);
			
			Core.addEventListener(dropeditor[0],"dragenter",actionListenerImg.DragEnter);
			Core.addEventListener(dropeditor[0],"dragleave",actionListenerImg.DragLeave);
			Core.addEventListener(dropeditor[0],"dragover",actionListenerImg.DragOver);
			Core.addEventListener(dropeditor[0],"drop",actionListenerImg.DropStart);
		}
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
		Endpoint.createEndpoint(indef,cntInDef,null);
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
		Endpoint.createEndpoint(outdef,cntOutDef,null);
		Code.writeCodeFromComponent(newComponent);
	},
	
	/*Gestisce l'evento click*/
	MouseListenerClick: function(pulsante){
		if(pulsante.title == "New"){
			if(componentVett.length != 0){
				if(confirm("Sure you want to leave this page?")){location.reload();}
			}
			else{location.reload();}
		}
		if(pulsante.title == "Save"){
			var sourcecode = Core.getElementsByClass("codeclass")[0];
			Code.estraiTesto(sourcecode,pulsante.title,GraphURIPrefix);
		}
		if(pulsante.title == "Properties"){
			//var json = JSON.stringify(componentVett);
		}
		if(pulsante.title == "Play & Save"){
			var sourcecode = Core.getElementsByClass("codeclass")[0];
			Code.estraiTesto(sourcecode,pulsante.title,GraphURIPrefix);
//			window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(URISystemGraphStore + encodeURIComponent(dataflowURI)),"_blank");
			window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(dataflowURI),"_blank");
		}
		
		if(pulsante.title == "load"){
			Component.jsonLoad();
		}
		
		if(pulsante.title == "publish"){
			Code.sendCodeURIUpdate();
		}
		
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
	DropStart: function(event){
		Core.preventDefault(event); 
		//Core.removeClass(this,"attivo");
		
		var id = event.dataTransfer.getData("compId");
		var dropeditor = Core.getElementsByClass("areaeditor");
		Component.createFromTypeId(id, dropeditor[0]);
	},
};

Core.start(actionListenerImg);
