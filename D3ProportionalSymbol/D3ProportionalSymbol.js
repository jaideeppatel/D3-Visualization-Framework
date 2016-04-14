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

        network.SVG.pathG = network.SVG.g.selectAll("path")
            .data(states)
            .enter()

        network.SVG.path = network.SVG.pathG
            .append("path")
            .classed("feature p", true)
            .attr("d", path)
            .on("click", clicked);

        var tipHTML = "";
        $.ajax({
            url: 'templates/popup-template.html',
            success: function(res) {
                tipHTML = res;
            },
            error: function(res) {
                tipHTML = "ERROR: Template not found"
            }
        })

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function(d) {
                // return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
                var headers = "<th>alt_name</th><th>lat</th><th>lng</th>";
                var body = ""
                d.values.children.forEach(function(d1, i1) {
                    body += "<td>" + d1.alt_name + "</td>" + "<td>" + d1.lat + "</td>" + "<td>" + d1.lng + "</td>"
                })

                return tipHTML.replace("%d", d.key).replace("%d", headers).replace("%d", body)
            })
        network.SVG.call(tip);

        network.update = function(filteredData) {
            try { network.SVG.nodeG.selectAll("*").remove(); } catch (e) {};
            network.SVG.nodeG = network.SVG.g.selectAll(".nodeG")
                .append("g")
                .data(filteredData)
                .enter()
                .append("g")
                .attr("transform", function(d, i) {
                    var arr = [d.values.lng, d.values.lat]
                    var proj = projection(arr)
                    if (proj == null) {
                        d3.select(this).remove()
                    } else {
                        return "translate(" + (proj[0] - 4.25) + "," + (proj[1] + 4.25) + ")"
                    }
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
            network.SVG.nodes = network.SVG.nodeG
                .append("circle")
                .classed("n", true)
                .attr("r", 4)
                .attr("cx", 0)
                .attr("cy", 0)
        }

        network.update(network.filteredData.records.data[network.currCategory])
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
                .classed("active", centered && function(d) {
                    return d === centered;
                });

            network.SVG.g.transition()
                .duration(750)
                .attr("transform", "translate(" + network.config.dims.fixedWidth / 2 + "," + network.config.dims.fixedHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");
        }
    }
    return network;
}
