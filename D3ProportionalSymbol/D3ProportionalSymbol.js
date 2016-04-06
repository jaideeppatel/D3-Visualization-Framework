visualizationFunctions.D3ProportionalSymbol = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.SVG = network.config.easySVG(element[0])
        .attr('background', 'white')
        .attr('class', 'canvas ' + opts.ngIdentifier)
        .style("overflow", "scroll")
        .attr('transform', 'translate(' + (network.config.margins.left) + ',' + (network.config.margins.top) + ')')

    network.VisFunc = function() {
        var shapeData = usShapeData;
        var projection = d3.geo.albersUsa()
            .scale(800)
            .translate([network.config.dims.fixedWidth / 2, network.config.dims.fixedHeight / 2])
        var path = d3.geo.path()
            .projection(projection)
        states = topojson.feature(shapeData, shapeData.objects.states).features
        
        network.SVG.g = network.SVG.append("g")

        network.SVG.g.selectAll("path")
            .data(states).enter()
            .append("path")
            .attr("class", "feature")
            // .style("stroke", "#7996A3")
            // .style("fill", "#BCBCBC")
            .style("stroke", "#DCEDD9")
            .style("fill", "#78C26D")
            .attr("d", path)
            .on("click", clicked);

        var data = network.AngularArgs.data.get("records");

        network.SVG.nodeG = network.SVG.g.selectAll(".nodeG")
            .append("g")
            .data(network.filteredData.records.data[network.currCategory])
            .enter()
            .append("g")
            .attr("class", function(d, i) {
                return "id " + i
            }).append("circle")
            .attr("class", "n")
            .style("stroke", "#351123")
            .style("fill", "#EC008B")
            .attr("r", 5)
          


        network.SVG.nodeG.attr("transform", function(d, i) {
            var arr = [d.values.lng, d.values.lat]
            var proj = projection(arr)
            if (proj == null) proj = [0,0];
            return "translate(" + proj[0] + "," + proj[1] + ")"
        })
        var centered;
        function clicked(d) {
          var x, y, k;

          if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
          } else {
            x = network.config.dims.fixedWidth / 2;
            y = network.config.dims.fixedHeight / 2;
            k = 1;
            centered = null;
          }

          network.SVG.g.selectAll("path")
              .classed("active", centered && function(d) { return d === centered; });

          network.SVG.g.transition()
              .duration(750)
              .attr("transform", "translate(" + network.config.dims.fixedWidth / 2 + "," + network.config.dims.fixedHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
              .style("stroke-width", 1.5 / k + "px");
        }
    }
    return network;
}
