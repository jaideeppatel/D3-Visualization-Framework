visualizationFunctions.BarGraphDistort = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.SVG = network.config.easySVG(element[0])
        .attr('background', 'white')
        .attr('class', 'canvas ' + opts.ngIdentifier)
        .style("overflow", "scroll")
        .append('g')
        .attr('transform', 'translate(' + (network.config.margins.left) + ',' + (network.config.margins.top) + ')')
    network.VisFunc = function() {
        var useData = network.filteredData[network.PrimaryDataAttr].data;
        var barHeight = 20;
        var heightFixed = 20 * useData.length;
        //TODO: Just extract this.
        network.Scales.x = d3.scale.log()
            .domain([0.1, 1.1])
            .range([0, network.config.dims.fixedWidth])
        network.Scales.x1 = d3.scale.log()
            .domain([0.1, 1.1])
            .range([0, network.config.dims.fixedWidth])
        network.Scales.y = d3.scale.linear()
            .domain([0, 1])
            .range([0, heightFixed])
        network.Scales.y1 = d3.scale.linear()
            .domain([0, 1])
            .range([0, heightFixed])


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
        network.SVG.barG = network.SVG.graphArea.selectAll(".barG")
            .data(useData)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0, " + (20 * i) + ")"
            })

        network.SVG.bar = network.SVG.barG.append("rect")
            .attr("class", function(d, i) {
                return "b b" + d.id
            })
            .attr("width", 20)
            .attr("height", barHeight - 1)
            .attr("fill", "green")
        network.SVG.barText = network.SVG.barG.append("text")
            .attr("x", -4)
            .attr("y", barHeight * .75)
            .attr("text-anchor", "end")
            .text("Null")

    }
    return network;
}
