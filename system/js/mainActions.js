MainActions = {}
MainActions.newPipe = function() {
	if(componentVett.length != 0){
		if(confirm("Sure you want to leave this page?")){location.reload();}
	}
	else{location.reload();}
};
MainActions.savePipe = function() {
	var sourcecode = Core.getElementsByClass("codeclass")[0];
	Code.estraiTesto(sourcecode,pulsante.title,GraphURIPrefix);
};
MainActions.viewPipeProperties = function() {
			//var json = JSON.stringify(componentVett);
};
MainActions.playPipe = function() {
	var sourcecode = Core.getElementsByClass("codeclass")[0];
	Code.estraiTesto(sourcecode,pulsante.title,GraphURIPrefix);
//	window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(URISystemGraphStore + encodeURIComponent(dataflowURI)),"_blank");
	window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(dataflowURI),"_blank");
};
MainActions.reloadPipe = function() {
	Component.jsonLoad();
};
MainActions.publishPipe = function() {
	Code.sendCodeURIUpdate();
};
