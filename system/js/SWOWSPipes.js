var SWOWSPipes = (function() {

	var _Pipeline = function(pipelineURI) {
		this.pipelineURI = pipelineURI;
		this.load();
	};

	_Pipeline.prototype.load = function(callback) {
		
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
		};
		
		Component.refreshEditor(document.getElementById("areaeditor"));
		
		var store = N3.Store();
		N3ServerSync.calliRead(
				this.pipelineURI,
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

//		Component.jsonLoad();
	};

	_Pipeline.prototype.save = function(callback) {
		
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
//				document.getElementsByClassName("jsplumb-draggable"),
				componentVett,
				jsPlumb,
				N3ServerSync.createCalliUpdateWriter(
						resourceURI,
						callback));
	};

	_Pipeline.prototype.viewProperties = function() {
				//var json = JSON.stringify(componentVett);
	};
	
	_Pipeline.prototype.play = function() {
//		var sourcecode = Core.getElementsByClass("codeclass")[0];
//		Code.estraiTesto(
//				sourcecode, pulsante.title);
////				GraphURIPrefix,
////		window.open("http://localhost:8080/swows-web/play?df=" + encodeURIComponent(URISystemGraphStore + encodeURIComponent(dataflowURI)),"_blank");
	};

	_Pipeline.prototype.publish = function() {
		Code.sendCodeURIUpdate();
	};
	
	var _setMainPipelineURI = function(mainPipelineURI) {
		SWOWSPipes._mainPipelineURI = mainPipelineURI;
	};

	var _getMainPipelineURI = function() {
		return SWOWSPipes._mainPipelineURI; 
	};
	
	var _setMainPipeline = function(mainPipeline) {
		SWOWSPipes._mainPipeline = mainPipeline;
	};
	
	var _getMainPipeline = function() {
		if (!SWOWSPipes._mainPipeline && SWOWSPipes._mainPipelineURI)
			SWOWSPipes._mainPipeline = new _Pipeline(SWOWSPipes._mainPipelineURI);
		return SWOWSPipes._mainPipeline; 
	};
	
	var _load = function(pipelineURI) {
		if (pipelineURI)
			_setMainPipelineURI(pipelineURI);
		_getMainPipeline().load();
	};

	var _save = function() {
		_getMainPipeline().save();
	};

	var _play = function() {
		_getMainPipeline().play();
	};

	return {
		Pipeline: _Pipeline,
		getMainPipelineURI: _getMainPipelineURI,
		setMainPipelineURI: _setMainPipelineURI,
		getMainPipeline: _getMainPipeline,
		setMainPipeline: _setMainPipeline,
		load: _load,
		save: _save,
		play: _play
	};

}());
