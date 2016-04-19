visualizationFunctions.BarGraphDistort = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
<<<<<<< HEAD
    network.config.margins.left2 = network.config.margins.left;
=======
    network.SVGBase = network.config.easySVG(element[0])
        .attr('background', 'white')
        .attr('class', 'canvas ' + opts.ngIdentifier)
        .style("overflow", "scroll")
    network.SVG = network.SVGBase.append("g")
        .attr('transform', 'translate(' + (network.config.margins.left) + ',' + (network.config.margins.top) + ')')
>>>>>>> 581294d8bc9c45911de03efb85543f8e7283ce82
    network.VisFunc = function() {
        network.config = network.CreateBaseConfig();
        network.config.margins.left = network.config.margins.left2;
        network.SVG = network.config.easySVG(element[0], {responsive:false})
            .attr('background', 'white')
            .attr('class', 'canvas ' + opts.ngIdentifier)
            .attr('transform', 'translate(' + (network.config.margins.left || 0) + ',' + (network.config.margins.top) + ')')
        var useData = network.filteredData[network.PrimaryDataAttr].data;
        var barHeight = 20;
        network.SVGBase.attr("height", useData.length * (barHeight) + barHeight * 2)
        network.SVG.attr("height", useData.length * (barHeight) + barHeight * 2)

        network.Scales.xScaleOffset = 0;
        if (network.config.meta[network.PrimaryDataAttr].styleEncoding.size.scale == "log") {
            network.Scales.xScaleOffset = .1;
        }
        //TODO: Just extract this.
        network.Scales.x = d3.scale[network.config.meta[network.PrimaryDataAttr].styleEncoding.size.scale || "linear"]()
            .domain([0 + network.Scales.xScaleOffset, 1 + network.Scales.xScaleOffset])
            .range([0, network.config.dims.fixedWidth])
        network.Scales.x1 = d3.scale[network.config.meta[network.PrimaryDataAttr].styleEncoding.size.scale || "linear"]()
            .domain([0 + network.Scales.xScaleOffset, 1 + network.Scales.xScaleOffset])
            .range([0, network.config.dims.fixedWidth])
        network.Scales.y = d3.scale.linear()
            .domain([0, 1])
            .range([0, parseInt(network.SVG.attr("height"))])
<<<<<<< HEAD
        network.Scales.y1 = network.Scales.y
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
            })
=======
        network.Scales.y1 = network.Scales.y;

>>>>>>> 581294d8bc9c45911de03efb85543f8e7283ce82
        network.config.margins.left = 150;
        network.config.easyGraphLayout(network);
        network.config.easyGraph(network, {
            x: {
                scale1: network.Scales.x,
                scale2: network.Scales.x1,
                orient: "top",
                label: ""
            },
            y: {
                scale1: network.Scales.y,
                scale2: network.Scales.y1,
                orient: "right",
                label: ""
            },
            t: {
                orient: "top",
                label: ""
            }
        });
        network.SVG.yAxisG.remove();
        network.update = function(filteredData) {
            try {network.SVG.barG.remove()} catch(e){}
            network.SVG.barG = network.SVG.graphArea.selectAll(".barG")
                .data(filteredData)
                .enter()
                .append("g")
                .attr("transform", function(d, i) {
                    return "translate(1, " + (20 * i) + ")"
                })                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)

            network.SVG.bar = network.SVG.barG.append("rect")
                .attr("class", function(d, i) {
                    return "b b" + d.id
                })
                .attr("width", 20)
                .attr("height", barHeight - 1)
            network.SVG.barText = network.SVG.barG.append("text")
                .attr("x", -4)
                .attr("y", barHeight * .75)
                .attr("text-anchor", "end")
                .text("Null")
            network.RunEvents();
        }
        network.update(useData);
    }
    return network;
}
