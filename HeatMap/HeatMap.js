visualizationFunctions.HeatMap = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.meta = network.config.meta;
    network.SVG = network.config.easySVG(element[0])
        .attr("background", "white")
        .attr("class", "canvas " + opts.ngIdentifier)
        .append("g")
        .attr("transform", "translate(" + (network.config.margins.left) + "," + (network.config.margins.top) + ")");
    network.VisFunc = function() {
        Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
        useData = network.filteredData.records.data;
        var barScaleValues = [];
        var scaleValues = [];

        useData = useData.sort(function(a, b) {
            return a.key - b.key;
        });

        useData.forEach(function(d, i) {
            d[network.config.meta.records.rowAggregator] = d[network.config.meta.records.rowAggregator].sort(function(a, b) {
                return a.key - b.key;
            })
        })

        var columns = network.SVG.selectAll(".coll")
            .append("g")
            .data(useData)
            .enter()
            .append("g")
            .attr("class", function(d, i) {
                return "col col-" + i
            }).each(function(d, i) {
                var elem = d3.select(this);
                elem.append("g").selectAll(".roww")
                    .append("g")
                    .data(d[network.config.meta.records.rowAggregator])
                    .enter()
                    .append("g")
                    .attr("class", function(d1, i1) {
                        return "row row-" + i1
                    })
            })

        network.Scales.gridAreaX = d3.scale.linear()
            .domain([0, useData.length])
            .range([network.config.meta.styleEncoding.gridOffsetX[0], network.config.dims.fixedWidth - network.config.margins.left - network.config.meta.styleEncoding.gridOffsetX[1]])
        network.Scales.gridAreaY = d3.scale.linear()
            .domain([0, d3.max(useData, function(d) {
                return d[network.config.meta.records.rowAggregator].length })])
            .range([network.config.meta.styleEncoding.gridOffsetY[0], network.config.dims.fixedHeight - network.config.margins.top - network.config.meta.styleEncoding.gridOffsetY[1]])

        useData.forEach(function(d, i) {
            d[network.config.meta.records.rowAggregator].forEach(function(d1, i1) {
                network.SVG.selectAll(".col-" + i).selectAll(".row-" + i1).append("g")
                    .attr("class", "cell cell-" + i + "-" + i1)
                    .property("column", i)
                    .property("row", i1)
                    .attr("transform", "translate(" + network.Scales.gridAreaX(i) + "," + network.Scales.gridAreaY(i1) + ")")
            })
        })

        var cellWidth = network.Scales.gridAreaX(1) - network.Scales.gridAreaX(0) - 2;
        var cellHeight = network.Scales.gridAreaY(1) - network.Scales.gridAreaY(0) - 2;
        network.SVG.selectAll(".cell")
            .append("rect")
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("fill", "lightgrey")
        network.SVG.selectAll(".cell")
            .append("text")
            .attr("x", cellWidth / 2)
            .attr("y", cellHeight / 2 + 5)
            .attr("text-anchor", "middle")

        network.rowLabels = []
        network.SVG.selectAll(".row").each(function() {
           var key = d3.select(this).data()[0].key;
           if (network.rowLabels.indexOf(key) == -1) {
                network.rowLabels.push(key)
           }
        })

        network.SVG.rowBarArea = network.SVG.append("g")
                .attr("transform", "translate(" + (network.Scales.gridAreaX.range()[1] + network.config.meta.styleEncoding.barOffset) + ",0)")
        network.SVG.colBarArea = network.SVG.append("g")
                .attr("transform", "translate(0," + (network.Scales.gridAreaY.range()[1] + network.config.meta.styleEncoding.barOffset) + ")")

        for (var i = 0; i < network.Scales.gridAreaY.domain()[1]; i++) {
            var label = network.SVG.append("g")
                .attr("class", "l yaxis yaxis-" + i)
                .attr("transform", "translate(" + (network.Scales.gridAreaX.range()[0] - 5) + "," + (network.Scales.gridAreaY(i) + cellHeight / 2 + 5) + ")")
            label.append("text")
                .attr("text-anchor", "end")
                .text(network.rowLabels[i])

            var bar = network.SVG.rowBarArea.append("g")
                .attr("class", "bar row-bar row-bar-" + i)
                .attr("transform", "translate(0," + network.Scales.gridAreaY(i) + ")")
            bar.append("rect")
                .attr("width", 10)
                .attr("height", cellHeight)
                .attr("fill", "lightgrey")
            bar.append("text")
                .attr("x", 2)
                .attr("y", cellHeight / 2 + 5)
                .attr("text-anchor", "start")

        }
        for (var i = 0; i < network.Scales.gridAreaX.domain()[1]; i++) {
            var label = network.SVG.append("g")
                .attr("class", "l xaxis xaxis-" + i)
                .attr("transform", "translate(" + (network.Scales.gridAreaX(i)) + "," + (network.Scales.gridAreaY.range()[0] - 5) + ")")
            label.append("text")
                .attr("x", cellWidth / 2 + 5)
                .attr("text-anchor", "middle")
                .text(useData[i].key)

            var bar = network.SVG.append("g")
                .attr("class", "bar col-bar col-bar-" + i)
                .attr("transform", "translate(" + network.Scales.gridAreaX(i) + "," + (network.Scales.gridAreaY.range()[1] + network.config.meta.styleEncoding.barOffset) + ")")
            bar.append("rect")
                .attr("width", cellWidth)
                .attr("height", 10)
                .attr("fill", "lightgrey")
            bar.append("text")
                .attr("x", cellWidth / 2 + 5)
                .attr("y", 14)
                .attr("text-anchor", "middle")
        }
        

        network.Scales.yAxis = d3.svg.axis()
            .scale(d3.scale.linear()
                .domain([0, 1])
                .range([0, 100]))
            .ticks(2)
            .tickFormat(d3.format("s"))
            .tickSize(d3.max(network.Scales.gridAreaY.range()) - d3.min(network.Scales.gridAreaY.range()))
            .orient("top");

        network.Scales.xAxis = d3.svg.axis()
            .scale(d3.scale.linear()
                .domain([0, 1])
                .range([0, 100]))
            .ticks(2)
            .tickFormat(d3.format("s"))
            .tickSize(d3.max(network.Scales.gridAreaX.range()) - d3.min(network.Scales.gridAreaX.range()))
            .orient("left");

        network.SVG.yAxis = network.SVG.colBarArea.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + (d3.max(network.Scales.gridAreaX.range())) + ",0)")
            // .call(network.Scales.xAxis);
        network.SVG.xAxis = network.SVG.rowBarArea.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0," + (network.Scales.gridAreaY(d3.max(network.Scales.gridAreaY.domain()))) + ")")
            // .call(network.Scales.yAxis);
    }
    return network;
}
