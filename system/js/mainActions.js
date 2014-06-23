MainActions = {}
MainActions.newPipe = function() {
	if(componentVett.length != 0){
		if(confirm("Sure you want to leave this page?")){location.reload();}
	}
	else{location.reload();}
};
MainActions.savePipe = function() {
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
				}
			});
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
	Component.jsonLoad();
};
MainActions.publishPipe = function() {
	Code.sendCodeURIUpdate();
};
