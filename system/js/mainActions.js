MainActions = {}

MainActions.newPipe = function() {
	if(componentVett.length != 0) {
		if(confirm("Sure you want to leave this page?")){location.reload();}
	}
	else{location.reload();}
};

MainActions.savePipe = function(callback) {
	
	var outerCallback = callback;
	var callback = function (err) {
		if (err) {
			alert('Error: ' + JSON.stringify(err));
			updateStatus('Error Saving Pipeline');
		} else {
			updateStatus('Pipeline Saved!');
		}
		if (outerCallback)
			outerCallback(err);
	}
	
	var editor = Core.getElementsByClass("areaeditor")[0];
//  Component.updatePositions(editor, componentVett);
	
	return linkedPlumb.jsPlumbToRDF(
//			document.getElementsByClassName("jsplumb-draggable"),
			componentVett,
			jsPlumb,
			N3ServerSync.createCalliUpdateWriter(
					resourceURI,
					callback));
};

MainActions.viewPipeProperties = function() {
			//var json = JSON.stringify(componentVett);
};
MainActions.playPipe = function() {
	var sourcecode = Core.getElementsByClass("codeclass")[0];
	Code.estraiTesto(
			sourcecode, pulsante.title,
//			GraphURIPrefix,
//	window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(URISystemGraphStore + encodeURIComponent(dataflowURI)),"_blank");
};

MainActions.reloadPipe = function(callback) {
	
	var outerCallback = callback;
	var callback = function (err) {
		if (err) {
			alert('Error: ' + JSON.stringify(err));
			updateStatus('Error Loading Pipeline');
		} else {
			updateStatus('Pipeline Loaded!');
		}
		if (outerCallback)
			outerCallback(err);
	}
	
	Component.refreshEditor(document.getElementById("areaeditor"));
	
	var store = N3.Store();
	N3ServerSync.calliRead(
			resourceURI,
			store,
			function(error) {
				if (error)
					callback(error);
				linkedPlumb.jsPlumbFromRDF(
						store, null, jsPlumb,
						{
							generatorFor: function(objectType) {
								return Component.factory.generatorFor(objectType) || Endpoint.factory.generatorFor(objectType);
							}
						});
				callback();
			});

//	Component.jsonLoad();
};
MainActions.publishPipe = function() {
	Code.sendCodeURIUpdate();
};
