//Head loads scripts in parellel, but executes them in order.

/** @global 
    @description Visualization instance configurations. Each instanced visualization function with a dataprep function [defined in /visuals/** /(ng-identifier).js] is stored here. This function is run before the visualization instance has been run. Allows data to be pre-formatted to fit a visualization's requirements. */
var dataprep = {};
/** @global 
    @description Visualization functions collection. Each visualization type [ng-vis-type] is stored once and used by each instance of the visualizaiton.*/
var visualizationFunctions = {};
/** @global 
    @description Instanced visualization collection. Each instanced visualization is stored by it's Angular identifier defined in the DOM [ng-Identifier]. */
var visualizations = {};
/** @global 
    @description Visualization instance events. Each instanced visualization with an events function [defined in /visuals/** /(ng-identifier)-config.js] is stored here. This function is called after the visualization instance has been run. Provides opportunities to add customization to the underlying visualization. */
var events = {};
/** @global 
    @description Visualization instance configurations. Each instanced visualization with an events function [defined in /visuals/** /(ng-identifier).js] is stored here. This function maps data properties to visualization attributes. */
var configs = {};
var meta = {};

/** @global 
    @description If set to true, will provide details on visualization binding. */
var verbose = false;

// function AJAX_JSON_Req(url) {
//     var ajaxRequest = new XMLHttpRequest();
//     ajaxRequest.open("GET", url, true);
//     ajaxRequest.setRequestHeader("Content-type", "application/json");

//     ajaxRequest.onreadystatechange = function() {
//         if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
//             var response = JSON.parse(ajaxRequest.responseText);
//             var loadedScripts = [];
//             response.forEach(function(d, i) {
//                 if (d.filename != 'visincludes.json' &&
//                     d.filename != 'includes.json' &&
//                     d.filename != 'App.js' &&
//                     d.filename != 'angular.min.js' &&
//                     d.filename != 'head.js' &&
//                     d.filename != 'Init.js' &&
//                     d.filename != 'jquery-1.11.2.min.js') {
//                     var temp = {};
//                     temp[d.filename.replace(/\./, '_')] = d.location;
//                     loadedScripts.push(temp);
//                 }
//             });
//             (function() {
//                 'use strict';
//                 head.js(loadedScripts);
//             }).call(this);
//             //TODO: Last index is null. Whyyyy?
//             head.ready(Object.keys(loadedScripts[loadedScripts.length - 2]), function() {
//                 angular.element(document).ready(function() {
//                     head.js('src/App.js');
//                 });
//             });
//         }
//     }
//     ajaxRequest.send();
// }

// AJAX_JSON_Req('src/tmp/includes.json');
(function() {
    'use strict';
    head.js({
        "angular-ui-router.js": "lib/angular-ui-router.js"
    }, {
        "bootstrap.min.js": "lib/bootstrap.min.js"
    }, {
        "d3.v3.min.js": "lib/d3.v3.min.js"
    }, {
        "datatables.min.js": "lib/datatables.min.js"
    }, {
        "head.js": "lib/head.js"
    }, {
        "immutable.js": "lib/immutable.js"
    }, {
        "jquery-1.11.2.min.js": "lib/jquery-1.11.2.min.js"
    }, {
        "jquery.mobile-1.4.5.min.js": "lib/jquery.mobile-1.4.5.min.js"
    }, {
        "json2.js": "lib/json2.js"
    }, {
        "leaflet-src.js": "lib/leaflet-src.js"
    }, {
        "leaflet.js": "lib/leaflet.js"
    }, {
        "smart-table.min.js": "lib/smart-table.min.js"
    }, {
        "DatasourceMap.js": "src/DatasourceMap.js"
    }, {
        "Utilities.js": "src/Utilities.js"
    }, {
        "Visualization.js": "src/Visualization.js"
    }, {
        "AngularTable.js": "visuals/AngularTable.js"
    }, {
        "angularTable01-configs.js": "visuals/angularTable01-configs.js"
    }, {
        "ProportionalSymbol.js": "visuals/ProportionalSymbol.js"
    }, {
        "tableController.js": "visuals/tableController.js"
    }, {
        "underlyingStateData.js": "visuals/underlyingStateData.js"
    }, {
        "tmp/includes.json": "src/tmp/includes.json"
    }, {
        "leaflet.css": "css/leaflet.css"
    }, {
        "style.css": "css/style.css"
    }, {
        "angular-route.js": "lib/angular-route.js"
    });
}).call(this);


head.ready('angular-route.js', function() {
    angular.element(document).ready(function() {
        head.js('src/App.js');
    });
});
