(function(){
//  var initialProperties = {};
  var app = angular.module("componentProperties",[]);
  app.controller('SelectedComponentPropertiesController', function() {
	  this.newInput = function(inputData) {
		  var name = inputData.name;
		  var identifier = inputData.name && calli.slugify(inputData.name);
		  var shape = inputData.shape;
		  var color = inputData.color;
		  var originalObject = inputData.originalObject;
		  return {
			get name() { return name; },
			set name(newName) {
				name = newName;
//				console.log("Slugify of '" + newName + "' is '" + calli.slugify(newName) + "'");
				this.identifier = calli.slugify(name);
			},
			identifier: identifier,
			shape: shape,
			color: color,
			originalObject: originalObject
		}
	  };
	  this.openFor = function(component) {
		  this.component = component;
		  if (component.allowsMultipleInputs()) { 
			  this.inputs = _.map(
					  component.getInputEndpoints(),
					  function(inputObject) {
						  return
						  	this.newInput({
							  name: inputObject.properties.name,
							  identifier: inputObject.properties.identifier,
							  shape: inputObject.properties.shape,
							  color: inputObject.properties.color,
							  originalObject: inputObject });
					  });
			  this.inputsToBeDeleted = [];
			  this.inputsToBeCreated = [];
		  }
	  };
	  this.addInput = function() {
		  var newInput =
			  	this.newInput({
				  shape: "dot",
				  color: "red"
			  	});
		  this.inputs.push(newInput);
		  this.inputsToBeCreated.push(newInput);
	  };
	  this.deleteInput = function(input) {
		  var inputIndex = this.inputs.indexOf(input);
		  if (inputIndex != -1) {
			  this.inputs.splice(inputIndex, 1);
		  }
		  var inputIndex = this.inputsToBeCreated.indexOf(input);
		  if (inputIndex)
			  this.inputsToBeCreated.splice(inputIndex, 1);
		  else
			  this.inputsToBeDeleted.push(input);
	  };
//	  this.uuid
	  this.close = function() {
		  this.component = null;
	  };
	  this.save = function() {
		  _.each(
				  this.inputsToBeDeleted, 
				  function(input) {
					  Endpoint.deleteEndpoint(input);
				  });
		  _.each(
				  this.inputs, 
				  function(input) {
					  var obj = input.originalObject;
					  if (obj) {
						  obj.properties.identifier = input.identifier;
						  obj.properties.name = input.name;
						  obj.properties.shape = input.shape;
						  obj.properties.color = input.color;
					  }
				  });
		  _.each(
				  this.inputsToBeCreated, 
				  function(input) {
					  Endpoint.createInputEndpoint(this.component,input);
				  });
		  this.close();
	  };
//	  this.component = Component.createComponentObject(0,"updatable","Ciccio", 50,50);
//    this.product = gem;
  });
})();

