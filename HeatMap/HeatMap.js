//TODO Remove this
Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


visualizationFunctions.HeatMap = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.meta = network.config.meta;
    network.SVG = network.config.easySVG(element[0])
        .attr("background", "white")
        .attr("class", "canvas " + opts.ngIdentifier)
        .append("g")
        .attr("transform", "translate(" + (network.config.margins.left + 60) + "," + (network.config.margins.top + 60) + ")");
    network.VisFunc = function() {
        Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
        useData = network.filteredData.records;
        var barScaleValues = [];
        var scaleValues = [];

        var nestedDataOtherDimension = d3.nest()
            .key(function(d) {
                return d[network.config.meta.records.colAggregator]
            })
            .rollup(function(leaves) {

                var obj = { children: leaves };
                useData.schema.forEach(function(d) {
                        if (d.type == "numeric") {
                            obj[d.name] = d3.sum(leaves, function(d1) {
                                return d1[d.name];
                            })
                        }
                    })
                    //TODO: Do something to extract this.
                barScaleValues.push(obj.NumAlive / obj.NumPatients)
                return obj;
            })
            .entries(useData.data);
        var nestedData = d3.nest()
            .key(function(d) {
                return d[network.config.meta.records.rowAggregator]
            })
            .key(function(d) {
                return d[network.config.meta.records.colAggregator]
            })
            .rollup(function(leaves) {
                var obj = { children: leaves };
                return obj;
            })
            .entries(useData.data);
        
        barScaleValues.sort();
        nestedData = nestedData.sort(function(a, b) {
            if (parseInt(a.key) >= parseInt(b.key)) {
                return 1
            };
            return -1
        })

        nestedData.forEach(function(d, i) {
            if (d.values.length < nestedDataOtherDimension.length) {
                var compareKeyMap = nestedDataOtherDimension.map(function(d1, i1) {
                    return d1.key;
                })
                var valueKeyMap = d.values.map(function(d1, i1) {
                    return d1.key;
                })
                valueKeyMap.forEach(function(d1, i1) {
                    compareKeyMap.remove(d1);
                })
            }

            d.values.forEach(function(d1, i1) {
                d1.values.children.forEach(function(d2, i2) {
                    useData.schema.forEach(function(d4) {
                        if (d4.type == "numeric") {
                            if (d1[d4.name]) {
                                d1[d4.name] += d2[d4.name];
                            } else {
                                d1[d4.name] = d2[d4.name]
                            }
                        }
                    })
                })
                useData.schema.forEach(function(d4) {
                    if (d4.type == "numeric") {
                        if (d[d4.name]) {
                            d[d4.name] += d1[d4.name];
                        } else {
                            d[d4.name] = d1[d4.name]
                        }
                    }
                })
                scaleValues.push(d1.NumAlive / d1.NumPatients || 0)
            })
        })

        scaleValues.sort();

        network.Scales.somethingScale = d3.scale.linear()
            .domain(d3.extent(scaleValues))
            .range([0, 1])

        network.Scales.colorScale = d3.scale.linear()
            .domain([network.Scales.somethingScale.domain()[1], ((network.Scales.somethingScale.domain()[1] + network.Scales.somethingScale.domain()[0]) / 2), network.Scales.somethingScale.domain()[0]])
            .range(["#BA635D", "#F4E98D", "#A2C283"].reverse())

        network.Scales.gridAreaX = d3.scale.linear()
            .domain([0, nestedDataOtherDimension.length])
            .range([10, network.config.dims.fixedWidth - 180])
        network.Scales.gridAreaY = d3.scale.linear()
            .domain([0, nestedData.length])
            .range([0, network.config.dims.fixedHeight - 180])
        network.Scales.barScale = d3.scale.linear()
            .domain([0, 1])
            .range([0, 100])

        network.SVG.gArea = network.SVG
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(" + network.Scales.gridAreaX(0) + ",0)";
            });

        network.SVG.hGroup = network.SVG.gArea.selectAll(".hGroup")
            .data(nestedData)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + network.Scales.gridAreaY(i) + ")";
            });

        var barWidth = d3.max(network.Scales.gridAreaX.range()) / nestedDataOtherDimension.length

        network.SVG.rowCells = network.SVG.hGroup
            .each(function(d, i) {
                var elem = d3.select(this);
                // nestedDataOtherDimension.forEach(function(d1a, i1) {
                d.values.forEach(function(d1, i1) {
                    // d1 = d.values[i1]
                    elem.append("rect")
                        .attr("x", (network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length) * i1)
                        .attr("width", barWidth - 3)
                        .attr("height", network.Scales.gridAreaY(1) - 3)
                        .attr("fill", network.Scales.colorScale(d1.NumAlive / d1.NumPatients))
                        .on("mouseover", function(d2, i2) {
                            network.SVG.selectAll("#text" + (i + "i" + i1))
                                .text(d1.NumAlive + "/" + d1.NumPatients)
                        })
                        .on("mouseout", function(d2, i2) {
                            network.SVG.selectAll("#text" + (i + "i" + i1))
                                .text(Math.floor(d1.NumAlive / d1.NumPatients * 10000) / 100 + "%")
                        })
                    elem.append("text")
                        .attr("id", "text" + (i + "i" + i1))
                        .attr("x", ((network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length) * i1) + (network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length - 3) / 2)
                        .attr("y", network.Scales.gridAreaY(1) / 2 + 3)
                        .style("text-anchor", "middle")
                        .text(Math.floor(d1.NumAlive / d1.NumPatients * 10000) / 100 + "%")
                })
                elem.append("rect")
                    .attr("x", network.Scales.gridAreaX(nestedDataOtherDimension.length))
                    .attr("width", function(d1, i1) {

                        return network.Scales.barScale(d1.NumAlive / d1.NumPatients)
                    })
                    .attr("height", network.Scales.gridAreaY(1) - 3)
                    .attr("fill", "#CCCCCC")
                elem.append("text")
                    .attr("x", network.Scales.gridAreaX(nestedDataOtherDimension.length))
                    .attr("y", network.Scales.gridAreaY(1) / 2 + 3)
                    .style("text-anchor", "start")
                    .text(Math.floor(d.NumAlive / d.NumPatients * 10000) / 100 + "%")
                elem.append("text")
                    .attr("x", -7)
                    .attr("y", network.Scales.gridAreaY(1) / 2 + 3)
                    .style("text-anchor", "end")
                    .text(d.key)
            })

        var hLeaf = network.SVG.gArea.append("g").selectAll(".hBars")
            .data(nestedDataOtherDimension)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + (network.Scales.gridAreaY(nestedData.length)) + ")"
            })



        network.SVG.append("text")
            .attr("x", network.config.dims.fixedWidth - 40)
            .attr("y", network.config.dims.fixedHeight / 2)
            .attr("transform", function(d) {
                var w = +d3.select(this).attr("x") + (this.getBBox().width / 2);
                var h = +d3.select(this).attr("y") + (this.getBBox().height / 2);
                return "rotate(90," + w + "," + (h) + ")";
            })
            .style("text-anchor", "middle")
            .text(network.config.meta.labels.yAxis)
        network.SVG.append("text")
            .attr("x", network.config.dims.fixedWidth / 2)
            .attr("y", -60)
            .style("text-anchor", "middle")
            .text(network.config.meta.labels.xAxis)


        hLeaf.append("text")
            .attr("x", function(d, i) {
                return barWidth * i + (barWidth / 2)
            })
            .attr("y", -(network.Scales.gridAreaY(nestedData.length)) - 7)
            .style("text-anchor", "middle")
            .text(function(d, i) {
                return { "@": "Normal", "H": "High", "L": "Low" }[d.key]
            })


        hLeaf.append("rect")
            .attr("x", function(d, i) {
                return barWidth * i
            })
            .attr("width", network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length - 3)
            .attr("height", function(d, i) {
                return network.Scales.barScale(d.values.NumAlive / d.values.NumPatients)
            })
            .attr("fill", "#CCCCCC")


        hLeaf.append("text")
            .attr("x", function(d, i) {
                return barWidth * i + (barWidth / 2)
            })
            .attr("y", 14)
            .style("text-anchor", "middle")
            .text(function(d, i) {
                return Math.floor(d.values.NumAlive / d.values.NumPatients * 10000) / 100 + "%"
            })
    }
    return network;
}
