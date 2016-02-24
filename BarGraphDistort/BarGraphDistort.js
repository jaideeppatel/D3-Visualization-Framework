visualizationFunctions.BarGraphDistort = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.VisFunc = function() {
		network.config = network.CreateBaseConfig();
		var useData = network.filteredData.records.data
		network.SVG = network.config.easySVG(element[0], {
				// "height": useData.length * 3,
				"background": "white"
			})
			.attr("class", "canvas " + opts.ngIdentifier)
			.append("g")
			.attr("transform", "translate(" + (network.config.margins.left) + "," + (network.config.margins.top) + ")");
		useData.map(function(d, i) {
				d.id = i;
			})
			//TODO: Make sort in VisualizationClass
		useData = useData.sort(function(a, b) {
			var sortAttr = network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr;
			return b[sortAttr] - a[sortAttr]
		})
		network.Scales.x = d3.scale.linear()
			.domain([0, 1])
			.range([3, network.config.dims.fixedWidth - (network.config.dims.fixedWidth * .3)])

		network.Scales.y = d3.scale.linear()
			.domain([0, 1])
			.range([0, (network.config.dims.fixedHeight) / useData.length])
		network.Scales.x1 = d3.scale.linear()
			.domain([0, 1])
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

		network.SVG.select(".domain").remove();

		network.config.easyGraphLayout(network);
		//TODO: Make returned scales non-destructive
		network.config.easyGraph(network, {
				"x": {
					"scale1": network.Scales.x,
					"scale2": network.Scales.x1,
					"orient": "top",
					"label": "SomethingX (First 100)"
				},
				"y": {
					"scale1": network.Scales.y,
					"scale2": network.Scales.y1,
					"orient": "right",
					"label": "SomethingY"
				},
				"t": {
					"orient": "top",
					"label": ""
				}
			})
			//TODO: Fix domain
		network.SVG.graphItem = network.SVG.graphArea.selectAll("item")
			.data(useData)
			.enter()
			.append("g")
			.attr("class", "item b")
			.each(function(d, i) {
				var curr = d3.select(this);
				var y = network.SVG.graphOpts.height / useData.length * i;
				curr.append("rect")
					.attr("height", 1)
				curr.append("circle")
					.attr("r", 5)
					.attr("fill", "white")
				curr.append("text")
					.attr("class", "l")
					.attr("x", -5)
					.text(d.val)
			})
		network.update = function(sel) {
			network.SVG.dataRange = d3.extent(sel.data(), function(d, i) {
				return d.val
			})
			network.Scales.x.domain(network.SVG.dataRange)
			network.config.easyGraph(network, {
				"x": {
					"scale1": network.Scales.x,
					"scale2": network.Scales.x1,
					"orient": "top",
					"label": "SomethingX (First 100)"
				},
				"y": {
					"scale1": network.Scales.y,
					"scale2": network.Scales.y1,
					"orient": "right",
					"label": "SomethingY"
				},
				"t": {
					"orient": "top",
					"label": ""
				}
			});
			network.SVG.yAxisG.remove();

			network.Scales.bar = d3.scale.linear()
				.domain(network.SVG.dataRange)
				.range([0, network.SVG.graphOpts.width])

			network.SVG.graphItem.style("display", "none")
			var seldata = sel.data().length;
			var duration = 50;
			sel.each(function(d, i) {
				sel.style("display", "block")
				var y = network.SVG.graphOpts.height / seldata * i;
				d3.select(this).selectAll("rect")
					.transition()
					.duration(duration)
					.attr("y", y)
					.attr("width", network.Scales.bar(d.val))
				d3.select(this).selectAll("circle")
					.transition()
					.duration(duration)
					.attr("cx", network.Scales.bar(d.val))
					.attr("cy", y)
				d3.select(this).selectAll("text")
					.transition()
					.duration(duration)
					.attr("y", y + 6)
			})
			network.SVG.graphArea.moveToFront();

		}

		network.update(network.SVG.graphItem)

		network.testUpdate = function() {
			var filt = network.SVG.selectAll(".item").filter(function(d, i) {
				if (d.val < 50) return true;
			});
			network.update(filt)
		}
		network.testUpdate2 = function() {
			var filt = network.SVG.selectAll(".item").filter(function(d, i) {
				if (d.val > 50) return true;
			});
			network.update(filt)
		}		
	}
	return network;
}


// visualizationFunctions.BarGraphDistort = function(element, data, opts) {
// 	var network = visualizations[opts.ngIdentifier];
// 	network.parentVis = visualizations[opts.ngComponentFor];
// 	network.VisFunc = function() {
// 		network.config = network.CreateBaseConfig();
// 		network.SVG = network.config.easySVG(element[0])
// 			.attr("background", "white")
// 			.attr("class", "canvas " + opts.ngIdentifier)
// 			.append("g")
// 			.attr("transform", "translate(" + (network.config.margins.left) + "," + (network.config.margins.top) + ")")
// 			console.log(network.filteredData)
// 			var useData = network.filteredData.records.data
// 			useData.map(function(d, i) {
// 				d.id = i;
// 			})			
// 			//TODO: Make sort in VisualizationClass
// 			useData = useData.sort(function(a, b) {
// 				var sortAttr = network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr;
// 				return b[sortAttr] - a[sortAttr]
// 			})

// 			network.Scales.x = d3.scale.linear()
// 				.domain([0,1])
// 				.range([3, network.config.dims.fixedWidth - (network.config.dims.fixedWidth * .3)])

// 			network.Scales.y = d3.scale.linear()
// 				.domain([0, 1])
// 				.range([0, (network.config.dims.fixedHeight) / useData.length])
// 			network.Scales.x1 = d3.scale.linear()
// 				.domain([0,1])
// 			network.Scales.y1 = d3.scale.linear()
// 				.domain([0, 1])

// 			network.SVG.xaxis = d3.svg.axis()
// 				.scale(network.Scales.x)
// 				.orient("top")
// 				.ticks(6)
// 				.tickSize(network.config.dims.fixedHeight)
// 				.tickFormat(function(d) {
// 					var test = Utilities.round(d, 2);
// 					return Utilities.format(test);
// 				})

// 			network.SVG.select(".domain").remove();

// 			network.config.easyGraphLayout(network);
// 			//TODO: Make returned scales non-destructive
// 			network.config.easyGraph(network, {
// 				x: {
// 					scale1: network.Scales.x,
// 					scale2: network.Scales.x1,
// 					orient: "top",
// 					label: "SomethingX (First 100)"
// 				},
// 				y: {
// 					scale1: network.Scales.y,
// 					scale2: network.Scales.y1,
// 					orient: "right",
// 					label: "SomethingY"
// 				},
// 				t: {
// 					orient: "top",
// 					label: ""	
// 				}
// 			})
// 			network.SVG.yAxisG.remove();
// 			network.Scales.x = d3.scale.linear()
// 				.domain([0,1])
// 				.range([3, network.SVG.graphOpts.width - (network.SVG.graphOpts.width * .3)])
// 			network.Scales.y = d3.scale.linear()
// 				.domain([0, 1])
// 				.range([0, (network.SVG.graphOpts.height) / useData.length])
// 			network.Scales.x1 = d3.scale.linear()
// 				.domain([0,1])
// 			network.Scales.y1 = d3.scale.linear()
// 				.domain([0, 1])

// 			network.SVG.gBars = network.SVG.graphG.selectAll(".gBarg")
// 				.append("g")
// 				.data(useData)
// 				.enter()
// 				.append("g")
// 				.attr("class", function(d, i) {
// 					return "gBar i" + i
// 				})
// 				.attr("transform", function(d, i) {
// 					return "translate(" + 0 + "," + (network.Scales.y(i)) + ")";
// 				})
// 			network.SVG.bars = network.SVG.gBars.append("rect")
// 				.attr("class", function(d, i) {
// 					return "b b" + d.id
// 				})
// 				.attr("width", function(d, i) {
// 					return d.id
// 				})
// 				.attr("height", function(d, i) {
// 					return network.Scales.y(1) - 4
// 				})
// 			network.SVG.barLabels = network.SVG.gBars.append("text")
// 				.attr("class", "l")
// 				.attr("x", -3)
// 				.attr("y", network.Scales.y(1) / 2 + 4)
// 	}
// 	return network;
// }
