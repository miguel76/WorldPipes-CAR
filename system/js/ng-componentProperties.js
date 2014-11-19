(function(){
//  var initialProperties = {};
  var app = angular.module("componentProperties",[]);
  app.controller('SelectedComponentPropertiesController', function() {
	  var createInput = function(inputData) {
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
		  this.component = {
				  name: component.Name,
				  URI: component.URI,
				  query: component.Query,
				  componentType: component.Component,
				  originalObject: component
		  };
		  this.component.allowsQuery = function() { return component.allowsQuery(); };
		  this.component.allowsMultipleInputs = function() { return component.allowsMultipleInputs(); };

		  if (component.allowsMultipleInputs()) {
			  this.inputs = _.map(
					  component.getInputEndpoints(),
					  function(inputObject) {
						  return createInput({
							  name: inputObject.properties.name,
							  identifier: inputObject.properties.identifier,
							  shape: inputObject.properties.shape,
							  color: inputObject.properties.color,
							  inDefault: inputObject.properties.inDefault,
							  originalObject: inputObject });
					  });
			  this.inputsToBeDeleted = [];
			  this.inputsToBeCreated = [];
		  }
	  };
	  this.addInput = function() {
		  var newInput =
			  	createInput({
				  shape: "Dot",
				  color: "Red"
			  	});
		  this.inputsToBeCreated.push(newInput);
		  this.inputs.push(newInput);
		  event.preventDefault(); 
	  };
	  this.deleteInput = function(input) {
		  var inputIndex = this.inputs.indexOf(input);
		  if (inputIndex != -1) {
			  this.inputs.splice(inputIndex, 1);
		  }
		  var inputIndex = this.inputsToBeCreated.indexOf(input);
		  if (inputIndex != -1)
			  this.inputsToBeCreated.splice(inputIndex, 1);
		  else
			  this.inputsToBeDeleted.push(input);
	  };
//	  this.uuid
	  this.close = function() {
		  this.component = null;
		  this.inputs = null;
	  };
	  this.save = function() {
//		  console.log(componentProperties);
//		  console.log(componentProperties.$valid);
//		  if (!componentProperties.$valid) {
//			  alert('Every input must have a name');
//			  return;
//		  };
		  var component = this.component;
		  component.originalObject.Name = component.name;
		  component.originalObject.URI = component.URI;
		  component.originalObject.Query = component.query;

		  _.each(
				  this.inputsToBeDeleted, 
				  function(input) {
					  Endpoint.deleteEndpoint(input.originalObject);
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
						  obj.properties.inDefault = input.inDefault;
					  }
				  });
		  _.each(
				  this.inputsToBeCreated, 
				  function(input) {
					  Endpoint.createInputEndpoint(component.originalObject,input);
				  });
		  this.close();
	  };
//	  this.component = Component.createComponentObject(0,"updatable","Ciccio", 50,50);
//    this.product = gem;
  });
  
  app.directive('componentProperties', function() {
	 return {
		restrict: 'E',
		templateUrl: SWOWSPipes.resource('component-properties.html')
	 };
  });

})();

