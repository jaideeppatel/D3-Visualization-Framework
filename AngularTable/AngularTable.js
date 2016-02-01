visualizationFunctions.AngularTable = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.meta = network.config.meta;
	network.VisFunc = function() {
		// var data = network.AngularArgs.data.get("").data;
		Utilities.runJSONFuncs(network.config.meta, [data, network.config]);


		var $injector = angular.injector(['ng', 'app']);
		$injector.invoke(function($rootScope, $compile) {

		
			var container = document.createElement("div");
			container.id = "table-container";
			container.className += "table-container"
			var string  = '<div ng-controller="basicExampleCtrl">'
			string +='<table class="table table-striped" at-table at-paginated at-list="list" at-config="config">';
			string += 	'<thead></thead>'
			string += 	'<tbody>'
			string += 		'<tr>'
			string += 			'<td at-implicit at-sortable at-attribute="id" width="150" at-initial-sorting="asc"></td>'
			string += 			'<td at-implicit at-sortable at-attribute="name"  width="250"></td>'
			string += 			'<td at-implicit at-sortable at-attribute="birthdate"></td>'
			string += 		'</tr>'
			string += 	'</tbody>'
			string += '</table>'
			string += '<at-pagination at-list="list" at-config="config"></at-pagination>'
			string += '</div>'
			$(container).html($compile(string)($rootScope))
			$(element).append(container);
		});


		console.log("I'm out here!")

	}
	return network;
}
