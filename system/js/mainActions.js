MainActions = {}

MainActions.newPipe = function() {
	if(componentVett.length != 0){
		if(confirm("Sure you want to leave this page?")){location.reload();}
	}
	else{location.reload();}
};

MainActions.savePipe = function() {
	
	var editor = Core.getElementsByClass("areaeditor")[0];
//  Component.updatePositions(editor, componentVett);
	
	var store = N3.Store();
	linkedPlumb.jsPlumbToRDF(
//			document.getElementsByClassName("jsplumb-draggable"),
			componentVett,
			jsPlumb, store);
	
	var writer = N3.Writer();
	writer.addTriples(store.find(null,null,null));
	writer.end(
			function (error, result) {
				if (error)
					console.error(error);
				else
					console.log("Store: " + result);
			});
	
//	var sourcecode = Core.getElementsByClass("codeclass")[0];
//	Code.estraiTesto(
//			sourcecode, pulsante.title,
////			GraphURIPrefix,
//			function(err) {
//				if (err) {
//					alert('Error: ' + JSON.stringify(err));
//					updateStatus('Error Saving Pipeline');
//				} else {
//					updateStatus('Pipeline Saved!');
//				}
//			});
};
MainActions.viewPipeProperties = function() {
			//var json = JSON.stringify(componentVett);
};
MainActions.playPipe = function() {
	var sourcecode = Core.getElementsByClass("codeclass")[0];
	Code.estraiTesto(
			sourcecode, pulsante.title,
//			GraphURIPrefix,
			function(err) {
				if (err) {
					alert('Error: ' + JSON.stringify(err));
					updateStatus('Error Saving Pipeline');
				} else {
					updateStatus('Pipeline Saved!');
					window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(dataflowURI),"_blank");
				}
			});
//	window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(URISystemGraphStore + encodeURIComponent(dataflowURI)),"_blank");
};

MainActions.reloadPipe = function() {
	
	Component.refreshEditor(document.getElementById("areaeditor"));
	
	linkedPlumb.jsPlumbFromRDF(
			store, null, jsPlumb,
			{
				generatorFor: function(objectType) {
					return Component.factory.generatorFor(objectType) || Endpoint.factory.generatorFor(objectType);
				}
			});

//	Component.jsonLoad();
};
MainActions.publishPipe = function() {
	Code.sendCodeURIUpdate();
};
