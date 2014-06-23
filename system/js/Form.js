/*In questo script si realizzano i form per permettere all'utente di inserire le propriet� di ogni componente.*/
var Form = {};

/*Crea il form corrispondente al componente passato in input*/
Form.createForm = function(parent,componentObject){
	console.log("Entering createForm for " + JSON.stringify(componentObject) + " inside " + parent);
	var componente = componentObject.Component;
	console.log("componente = " + componente);
	
	form = document.createElement("form");
	form.name = "Properties";
	form.setAttribute("method","POST");
	form.setAttribute("class","compForm");
//	form.setAttribute("action","WorldPipesNew.html");
			
	var fieldset = document.createElement("fieldset");
//	fieldset.setAttribute("id","form");
	fieldset.setAttribute("class","compFormFieldset");
	
	fieldset.innerHTML += "<input type='hidden' name='code' value='" + componentObject.code + "'>"
	
	if (componente == "output" || componente == "dataset" || componente == "input"){
		fieldset.innerHTML += "<label class='compFormLabel'>URI</br> <input class='compFormInput' name='URI' type='text' size = '35' value='"+ componentObject.URI + "'></br> </label>";
	}

	fieldset.innerHTML += "<label class='compFormLabel'>Name <input class='compFormInput' name='Name' type='text' size = '35' value='"+ componentObject.Name +"'></br></br> </label>";
	
	if(componente == "construct" || componente == "updatable"){
		fieldset.innerHTML += "<label class='compFormLabel'> Query</br> <textarea name='Query' id='compQuery' class='compFormInput compFormTextarea'>" + componentObject.Query + "</textarea></br></br> </label>";
		Form.createAddTable(fieldset,componentObject.InputList);
	}		
	if(componente == "pipeline"){
// TODO
	}
	fieldset.innerHTML += "<button type='submit' name='submit'>Save</button> <button type='reset' name='reset'>Cancel</button>";
	form.appendChild(fieldset);
	
	for(var i=0;i<form.length;i++){
		if(form[i].name == "deleterow"){
			Core.addEventListener(form[i],"click",function(){
				var table = document.getElementById("tableInput");
				var i = this.parentNode.parentNode.rowIndex;
				
				var name = table.rows[i].cells[0].firstChild.value;
				var id = table.rows[i].cells[1].firstChild.value;
				
				
				InputType.eliminaInputTable(Component.InputList,name,id);
				Endpoint.eliminaEndpointTable(parent,name);
				
				table.deleteRow(i);
			});
		}
		if(form[i].name == "addrow"){
			Core.addEventListener(form[i],"click",function(){
				var table = document.getElementById("tableInput");
				
				var rowCount = table.rows.length;
				var tr = table.insertRow(rowCount)
					var td = tr.insertCell(0);
					td.setAttribute("id","inputName");
						var input = document.createElement("input");
						input.setAttribute("class","compFormInputsTableCell");
						input.setAttribute("type","text");
						input.value = "Input " + rowCount;
						input.name = "nameInput";
					td.appendChild(input);
				
					var td = tr.insertCell(1);
					td.setAttribute("id","inputName");
						var input = document.createElement("input");
						input.setAttribute("class","compFormInputsTableCell");
						input.setAttribute("type","text");
						input.value = "InputId" + rowCount;
						input.name = "idInput";
					td.appendChild(input);
					
					var td = tr.insertCell(2);
						var select = document.createElement("select");
						select.setAttribute("id","select");
						select.name = "shape";
						
						var shape1 = document.createElement("option");
						shape1.appendChild(document.createTextNode("Dot"));
						var shape2 = document.createElement("option");
						shape2.appendChild(document.createTextNode("Rectangle"));
			
						select.appendChild(shape1);
						select.appendChild(shape2);
					td.appendChild(select);
					
					var td = tr.insertCell(3);
						var select = document.createElement("select");
						select.setAttribute("id","select");
						select.name = "color";
						
						var color1 = document.createElement("option");
						color1.appendChild(document.createTextNode("Red"));
						var color2 = document.createElement("option");
						color2.appendChild(document.createTextNode("Yellow"));
						var color3 = document.createElement("option");
						color3.appendChild(document.createTextNode("Blue"));
						var color5 = document.createElement("option");
						color5.appendChild(document.createTextNode("Black"));
						var color6 = document.createElement("option");
						color6.appendChild(document.createTextNode("Green"));
							
						select.appendChild(color1);
						select.appendChild(color2);
						select.appendChild(color3);
						select.appendChild(color5);
						select.appendChild(color6);
					td.appendChild(select);
	
					var td = tr.insertCell(4);
						var del = document.createElement("input");
						del.setAttribute("type","button");
						del.value = "x";						
						del.name = "deleterow";
						
						Core.addEventListener(del,"click",function(){
							var table = document.getElementById("tableInput");
							var i = this.parentNode.parentNode.rowIndex;
				
							var name = table.rows[i].cells[0].firstChild.value;
							var id = table.rows[i].cells[1].firstChild.value;
							
							InputType.eliminaInputTable(Component.InputList,name,id);
							Endpoint.eliminaEndpointTable(parent,name);
					
							table.deleteRow(i);
						});
						
					td.appendChild(del);
			});
		}
	}
	
	/*Gestione evento submit*/
	form.addEventListener("submit",function(evt){
		evt.preventDefault();
		
		/*** Occorre salvare i dati inseriti nel form per poterli poi inviare al server ***/
		var inputVett = componentObject.InputList;
		
		if(componente == "construct" || componente == "updatable"){
			var table = document.getElementById("tableInput");
			InputType.fillVett(table,inputVett,parent);
			Endpoint.createEndpoint(parent,cnt,1);
		}
		
		var x = parent.offsetLeft;
		var y = parent.offsetTop;
	
		if(inputVett != null && inputVett.length != 0){
			Component.modifica(componentObject.Code,(Form.getID() != null) ? Form.getID() : Form.getURI(),Form.getURI(),Form.getName(),Form.getQuery(),inputVett,x,y);
		}
		else{Component.modifica(componentObject.Code,(Form.getID() != null) ? Form.getID() : Form.getURI(),Form.getURI(),Form.getName(),Form.getQuery(),null,x,y);}
		
//		Code.modificaCodice(cnt);
		Code.updateCodeFromComponent(componentObject);
		
		var sourcecode = Core.getElementsByClass("codeclass")[0];
		
		Code.estraiTesto(
				sourcecode, "formSave",
//				GraphURIPrefix,
				function(err) {
					if (err) {
						alert('Error: ' + JSON.stringify(err));
						updateStatus('Error Saving Pipeline');
						evt.preventDefault();
					} else {
						updateStatus('Pipeline Saved!');
						
//						var label = Component.scriviNome(parent,cnt);
						
						var label = parent.getElementsByClassName("compLabel")[0];
						label.textContent = componentObject.name;
						
						var figli = parent.childNodes;
						parent.replaceChild(label,figli[1]);
						
						form.parentNode.removeChild(form);
						document.getElementById("dialogBackground").style.display = "none";
						evt.preventDefault();
					}
				});
		
	});

	/*Gestione evento reset*/
	form.addEventListener("reset",function(event){
		form.parentNode.removeChild(form);
		document.getElementById("dialogBackground").style.display = "none";
		Core.preventDefault(event);
	});
	
	return form;
};

/*Crea la tabella degli input prensente ne grafici Construct e Updatable*/
Form.createAddTable = function(form,inputVett){
	var table = document.createElement("table");
	table.setAttribute("id","tableInput");
	table.name = "tableinput";
	
	var thead = document.createElement("thead");
		var tr = document.createElement("tr");
			var th = document.createElement("th");
			th.setAttribute("class","inputsTableLabel");
			th.appendChild(document.createTextNode("Input"));
		tr.appendChild(th);
						
			var th = document.createElement("th");
			th.setAttribute("class","inputsTableLabel");
			th.appendChild(document.createTextNode("ID"));
		tr.appendChild(th);
						
			var th = document.createElement("th");
			th.setAttribute("class","inputsTableLabel");
			th.appendChild(document.createTextNode("Shape"));
		tr.appendChild(th);
		
		var th = document.createElement("th");
		th.setAttribute("class","inputsTableLabel");
			th.appendChild(document.createTextNode("Color"));
		tr.appendChild(th);
	thead.appendChild(tr);
	
	table.appendChild(thead);
	
	if(inputVett.length != 0){Form.displayTable(table,inputVett);}	
		
	var add = document.createElement("input");
	add.setAttribute("type","button");
	add.value = "Add Input";
	add.name = "addrow";
	
	form.appendChild(table);	
	form.appendChild(add);
	form.innerHTML += "</br></br>";
};

/*Restituisce il codice del form associato a quel componente*/
Form.getCode = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "code"){ return form[i].value; }
	}
};

/*Restituisce l'ID inserito in input nel form*/
Form.getID = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "ID"){ return form[i].value; }
	}
};

/*Restituisce l'URI inserito in input nel form*/
Form.getURI = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "URI"){ return form[i].value; }
	}
};

/*Restituisce il nome inserito in input nel form*/
Form.getName = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "Name"){ return form[i].value; }
	}
};

/*Restituisce la query scritta nella textarea del form*/
Form.getQuery = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "Query"){return form[i].value; }
	}
};

/*Restituisce il nome contenuto nella colonna Input della tabella degli input*/
Form.getTableName = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "nameInput"){return form[i].value;}
	}
};

/*Restituisce l'id contenuto nella colonna ID della tabella degli input*/
Form.getTableId = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "idInput"){return form[i].value;}
	}
};

/*Restituisce shape contenuto nella colonna Shape della tabella degli input*/
Form.getTableShape = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "shape"){return form[i].value;}
	}
};

/*Restituisce il color contenuto nella colonna Color della tabella degli input*/
Form.getTableColor = function(){
	for(var i=0; i<form.length;i++){
		if(form[i].name == "color"){return form[i].value;}
	}
};

Form.displayTable = function(table,inputVett){
	var tbody = document.createElement("body");
	for(var i=0;i<inputVett.length;i++){	
		var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.setAttribute("id","inputName");
				var input = document.createElement("input");
				input.setAttribute("id","inputRow");
				input.setAttribute("type","text");
				input.name = "nameInput";
				input.setAttribute("value",inputVett[i].Name);
			td.appendChild(input);
			tr.appendChild(td);
					
			var td = document.createElement("td");
			td.setAttribute("id","inputName");
				var input = document.createElement("input");
				input.setAttribute("id","inputRow");
				input.setAttribute("type","text");
				input.name = "idInput";
				input.setAttribute("value",inputVett[i].Id);
			td.appendChild(input);
		tr.appendChild(td);
		
			var td = document.createElement("td");
				var select = document.createElement("select");
				select.setAttribute("id","select");
				select.name = "shape";
						
				var shape1 = document.createElement("option");
				shape1.appendChild(document.createTextNode("Dot"));
				var shape2 = document.createElement("option");
				shape2.appendChild(document.createTextNode("Rectangle"));
						
				var shape = inputVett[i].Shape;
				if(shape == "Dot"){shape1.setAttribute("selected","selected");}
				if(shape == "Rectangle"){shape2.setAttribute("selected","selected");}
							
				select.appendChild(shape1);
				select.appendChild(shape2);
			td.appendChild(select);
		tr.appendChild(td);
					
			var td = document.createElement("td");
				var select = document.createElement("select");
				select.setAttribute("id","select");
				select.name = "color";
					
				var color1 = document.createElement("option");
				color1.appendChild(document.createTextNode("Red"));
				var color2 = document.createElement("option");
				color2.appendChild(document.createTextNode("Yellow"));
				var color3 = document.createElement("option");
				color3.appendChild(document.createTextNode("Blue"));
				var color5 = document.createElement("option");
				color5.appendChild(document.createTextNode("Black"));
				var color6 = document.createElement("option");
				color6.appendChild(document.createTextNode("Green"));
							
				var color = inputVett[i].Color;
				if(color == "Red"){color1.setAttribute("selected","selected");}
				if(color == "Yellow"){color2.setAttribute("selected","selected");}
				if(color == "Blue"){color3.setAttribute("selected","selected");}
				if(color == "Black"){color5.setAttribute("selected","selected");}
				if(color == "Green"){color6.setAttribute("selected","selected");}
						
				select.appendChild(color1);
				select.appendChild(color2);
				select.appendChild(color3);
				select.appendChild(color5);
				select.appendChild(color6);
			td.appendChild(select);
		tr.appendChild(td);
	
			var td = document.createElement("td");
				var del = document.createElement("input");
				del.setAttribute("type","button");
				del.value = "x";
				del.name = "deleterow";
			td.appendChild(del);
		tr.appendChild(td);		
		tbody.appendChild(tr);	
	}
	table.appendChild(tbody);
};
