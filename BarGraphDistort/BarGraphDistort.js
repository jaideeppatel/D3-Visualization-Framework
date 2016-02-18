visualizationFunctions.BarGraphDistort = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.VisFunc = function() {
		network.config = network.CreateBaseConfig();
		network.SVG = network.config.easySVG(element[0])
			.attr("background", "white")
			.attr("class", "canvas " + opts.ngIdentifier)
			.append("g")
			.attr("transform", "translate(" + (network.config.margins.left) + "," + (network.config.margins.top) + ")")
			console.log(network.filteredData)
			var useData = network.filteredData.records.data.splice(0,100)
			useData.map(function(d, i) {
				d.id = i;
			})
			//TODO: Remove
			// useData = useData.slice(0,64)
			
			//TODO: Make sort in VisualizationClass
			useData = useData.sort(function(a, b) {
				var sortAttr = network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr;
				return b[sortAttr] - a[sortAttr]
			})

			network.Scales.x = d3.scale.linear()
				.domain([0,1])
				.range([3, network.config.dims.fixedWidth - (network.config.dims.fixedWidth * .3)])

			network.Scales.y = d3.scale.linear()
				.domain([0, 1])
				.range([0, (network.config.dims.fixedHeight) / useData.length])
			network.Scales.x1 = d3.scale.linear()
				.domain([0,1])
			network.Scales.y1 = d3.scale.linear()
				.domain([0, 1])

			network.SVG.xaxis = d3.svg.axis()
				.scale(network.Scales.x)
				.orient("top")
				.ticks(6)
				.tickSize(network.config.dims.fixedHeight)
				.tickFormat(function(d) {
					var test = Utilities.round(d, 2);
					return Utilities.format(test);
				})

			// network.SVG.gxaxis = network.SVG.append("g")
			// 	.attr("class", "axis l l2")
			// 	.style("stroke-width", 1)
			// 	.attr("transform", "translate(" + (network.SVG.graphOpts.width * .3 - 3) + "," + (network.config.dims.fixedHeight + 25) + ")")
			// 	.call(network.SVG.xaxis)
			network.SVG.select(".domain").remove();


			network.config.easyGraphLayout(network);
			//TODO: Make returned scales non-destructive
			network.config.easyGraph(network, {
				x: {
					scale1: network.Scales.x,
					scale2: network.Scales.x1,
					orient: "top",
					label: "SomethingX (First 100)"
				},
				y: {
					scale1: network.Scales.y,
					scale2: network.Scales.y1,
					orient: "right",
					label: "SomethingY"
				},
				t: {
					orient: "top",
					label: ""	
				}
			})
			network.SVG.yAxisG.remove();
			network.Scales.x = d3.scale.linear()
				.domain([0,1])
				.range([3, network.SVG.graphOpts.width - (network.SVG.graphOpts.width * .3)])
			network.Scales.y = d3.scale.linear()
				.domain([0, 1])
				.range([0, (network.SVG.graphOpts.height) / useData.length])
			network.Scales.x1 = d3.scale.linear()
				.domain([0,1])
			network.Scales.y1 = d3.scale.linear()
				.domain([0, 1])

			network.SVG.gBars = network.SVG.graphG.selectAll(".gBarg")
				.append("g")
				.data(useData)
				.enter()
				.append("g")
				.attr("class", function(d, i) {
					return "gBar i" + i
				})
				.attr("transform", function(d, i) {
					return "translate(" + 0 + "," + (network.Scales.y(i)) + ")";
				})
			network.SVG.bars = network.SVG.gBars.append("rect")
				.attr("class", function(d, i) {
					return "b b" + d.id
				})
				.attr("width", function(d, i) {
					return d.id
				})
				.attr("height", function(d, i) {
					return network.Scales.y(1) - 2
				})
			network.SVG.barLabels = network.SVG.gBars.append("text")
				.attr("class", "l")
				.attr("x", -3)
				.attr("y", network.Scales.y(1) / 2 + 3)

				


	}
	return network;
}