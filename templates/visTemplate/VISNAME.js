visualizationFunctions.VISNAME = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.SVG = network.config.easySVG(element[0])
        .attr("background", "white")
        .attr("class", "canvas " + opts.ngIdentifier)
    network.VisFunc = function() {
    }
    return network;
}
