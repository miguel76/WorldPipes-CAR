(function(){
//  var initialProperties = {};
  var app = angular.module("componentProperties",[]);
  app.controller('SelectedComponentPropertiesController', function() {
	  this.openFor = function(component) {
		  this.component = component;
	  };
	  this.close = function() {
		  this.component = null;
	  };
//	  this.component = Component.createComponentObject(0,"updatable","Ciccio", 50,50);
//    this.product = gem;
  });
})();

