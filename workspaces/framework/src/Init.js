//Head loads scripts in parellel, but executes them in order.
var visualizations = {};
var visualizationFunctions = {};
var Events = {};
var Configs = {};
function AJAX_JSON_Req(url) {
	var ajaxRequest = new XMLHttpRequest();
	ajaxRequest.open("GET", url, true);
	ajaxRequest.setRequestHeader("Content-type", "application/json");

	ajaxRequest.onreadystatechange = function() {
		if (ajaxRequest.readyState == 4 &&	ajaxRequest.status == 200) {
			var response = JSON.parse(ajaxRequest.responseText);
			var loadedScripts = [];
			response.forEach(function(d, i) {
				if (d.filename != 'visincludes.json' && 
					d.filename != 'includes.json' && 
					d.filename != 'App.js' && 
					d.filename != 'angular.min.js' && 
					d.filename != 'head.js' && 
					d.filename != 'Init.js' && 
					d.filename != 'jquery-1.11.2.min.js') {
					var temp = {};
					temp[d.filename.replace(/\./, '_')] = d.location;
					loadedScripts.push(temp);
				}
			});
			(function() {
				'use strict';
				head.js(loadedScripts);
			}).call(this);
			//TODO: Last index is null. Whyyyy?
			head.ready(Object.keys(loadedScripts[loadedScripts.length - 2]), function() {
				angular.element(document).ready(function() {
					head.js('src/App.js');
				});
			});
		}
	}
	ajaxRequest.send();
}

AJAX_JSON_Req('src/tmp/includes.json');
