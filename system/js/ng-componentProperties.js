(function(){
//  var initialProperties = {};
  var app = angular.module("componentProperties",[]);
  app.controller('SelectedComponentPropertiesController', function() {
	  this.openFor = function(component) {
		  this.component = component;
		  if (component.allowsMultipleInputs()) { 
			  this.inputs = component.getInputEndpoints();
			  this.inputsToBeDeleted = [];
		  }
	  };
	  this.addInput = function() {
		  this.inputs |= {
				  shape: "dot",
				  color: "red"
		  };
	  };
	  this.deleteInput(input) = function() {
		  this.inputs.remove(input);
		  this.inputsToBeDeleted |= input.uuid;
	  };
	  this.uuid
	  this.close = function() {
		  this.component = null;
	  };
//	  this.component = Component.createComponentObject(0,"updatable","Ciccio", 50,50);
//    this.product = gem;
  });
})();

