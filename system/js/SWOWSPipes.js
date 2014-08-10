var SWOWSPipes = (function() {
	
	var mecomp = function (localName) {
		return "http://rdf.myexperiment.org/ontologies/components/" + localName;
	};

	var rdf = function (localName) {
		return "http://www.w3.org/1999/02/22-rdf-syntax-ns#" + localName;
	};

	var dc = function (localName) {
		return "http://purl.org/dc/elements/1.1/" + localName;
	};

	var dcterms = function (localName) {
		return "http://purl.org/dc/terms/" + localName;
	};

	var graphic = function (localName) {
		return "http://purl.org/viso/graphic/" + localName;
	};

	var calli = function (localName) {
		return "http://callimachusproject.org/rdf/2009/framework#" + localName;
	};
	
	var prov = function (localName) {
		return "http://www.w3.org/ns/prov#" + localName;
	};
	
	var _PipelineStore = function(storeURI) {
		this.storeURI = storeURI;
	};

	var _Pipeline = function(storeURI, pipelineURI) {
		this.storeURI = storeURI;
		this.pipelineURI = pipelineURI;
		if (this.storeURI && !this.pipelineURI)
			this.pipelineURI = this.storeURI;
		if (!this.storeURI && this.pipelineURI)
			this.storeURI = URI(this.pipelineURI).pathname("/").toString();
//		this.load();
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
//		N3ServerSync.calliRead(
//				this.pipelineURI,
//				store,
//				function(error) {
//					if (error)
//						callback(error);
//					linkedPlumb.jsPlumbFromRDF(
//							store, null, jsPlumb,
//							{
//								generatorFor: function(objectType) {
//									return Component.factory.generatorFor(objectType) || Endpoint.factory.generatorFor(objectType);
//								}
//							});
//					this.graph = store;
//					callback();
//				});
		var viewQuery =
			"CONSTRUCT { " +
				"<" + this.pipelineURI + "> <" + mecomp("has-component") + "> ?component. " +
				"<" + this.pipelineURI + "> <" + calli("hasComponent") + "> ?component. " +
				"?component ?p ?o. " +
			"} " +
			"WHERE { " +
				"<" + this.pipelineURI + "> <" + mecomp("has-component") + "> ?component. " +
				"OPTIONAL { " +
					"?component ?p ?o. " +
					"FILTER(?p != <" + prov("wasGeneratedBy") + ">) . " +
				"}" +
			"}";
		
		var pipeline = this;
//		var pipelineURI = this.pipelineURI;
		N3ServerSync.calliQuery(
				this.storeURI + "sparql",
				viewQuery,
				store,
				function(error) {
					if (error)
						callback(error);
					componentVett = linkedPlumb.jsPlumbFromRDF(
							store, pipeline.pipelineURI, jsPlumb,
							{
								generatorFor: function(objectType) {
									return Component.factory.generatorFor(objectType) || Endpoint.factory.generatorFor(objectType);
								}
							});
					pipeline.graph = store;
					callback();
				});

//		Component.jsonLoad();
	};

	_Pipeline.prototype.save = function(callback) {
		
		console.log("Saving pipeline " + this.pipelineURI);
		updateStatus('Saving Pipeline...');
		
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
		
		var pipeline = this;
		return linkedPlumb.jsPlumbToRDF(
//				document.getElementsByClassName("jsplumb-draggable"),
				componentVett,
				jsPlumb,
				N3ServerSync.createCalliUpdateWriter(
						this.storeURI,
						this.pipelineURI,
						this.graph,
						function(error, newGraph) {
							if (error)
								callback(error);
							pipeline.graph = newGraph;
							callback();
						}),
				this.pipelineURI);
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
	
	var _setMainStoreURI = function(storeURI) {
		SWOWSPipes._mainStoreURI = mainStoreURI;
	};

	var _getMainStoreURI = function() {
		return SWOWSPipes._mainStoreURI; 
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
			SWOWSPipes._mainPipeline = new _Pipeline(SWOWSPipes._mainStoreURI, SWOWSPipes._mainPipelineURI);
		return SWOWSPipes._mainPipeline; 
	};
	
	var _load = function(storeURI, pipelineURI) {
		if (storeURI)
			_setMainStoreURI(storeURI);
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
