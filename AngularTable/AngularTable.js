visualizationFunctions.HeatMap = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.meta = network.config.meta;
	network.VisFunc = function() {
		var data = network.AngularArgs.data.get("records").data;
		Utilities.runJSONFuncs(network.config.meta, [data, network.config]);

	}
	return network;
}