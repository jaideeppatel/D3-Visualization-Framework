visualizationFunctions.HeatMap = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.meta = network.config.meta;

	var data = network.GetData();
	network.SVG = network.config.easySVG(element[0])
		.attr("background", "white")
		.attr("class", "canvas " + opts.ngIdentifier)
		.append("g")
		.attr("transform", "translate(" + network.config.margins.left + "," + network.config.margins.top + ")");
	network.VisFunc = function() {
		var data = network.GetData().records.data;
		Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
		//TODO: Get these from data when we get the data
		var factCountPercentile = [{val:5}, {val:15}, {val:25}, {val:35}, {val:45}, {val:55}, {val:65}, {val:75}, {val:85}, {val:95}];
		var ageRange = [{val:5}, {val:15}, {val:25}, {val:35}, {val:45}, {val:55}, {val:65}, {val:75}, {val:85}];
		// for (var i = 0; i < 9; i++) {
		// 	// var date = new Date();
		// 	// date.setDate(date.getDate() - date.getDay() - 1);
		// 	// date.setDate(date.getDate() + i);
		// 	// ageRange.push(date);
		// 	ageRange.push(i);
		// }

		network.Scales.x = d3.scale.linear()
			.domain(d3.extent(ageRange, function(d, i) { return d.val}))
			//graphWidth

		network.config.easyGraphLayout(network);
		network.SVG.graphOpts.celPadding = 1;
		network.SVG.graphOpts.cellWidth = network.SVG.graphOpts.width / ageRange.length;
		network.SVG.graphOpts.cellHeight = network.SVG.graphOpts.height / factCountPercentile.length;

		network.Scales.y = Utilities.makeDynamicScale(factCountPercentile, "val", "linear", [network.SVG.graphOpts.height - network.SVG.graphOpts.cellHeight /2, network.SVG.graphOpts.cellHeight / 2])
		network.Scales.x1 = d3.scale.linear()
			.domain(network.Scales.x.domain())
		network.Scales.y1 = d3.scale.linear()
			.domain(network.Scales.y.domain())

		network.config.easyGraph(network, {
			x: {
				scale1: network.Scales.x,
				scale2: network.Scales.x1,
				orient: "bottom",
				label: "SomethingX"
			},
			y: {
				scale1: network.Scales.y,
				scale2: network.Scales.y1,
				orient: "left",
				label: "SomethingY"
			},
			t: {
				orient: "top",
				label: opts.ngDataField	
			}
		});

		network.Scales.xAxis
			.tickSize(5)
			.ticks(7)
			// .tickFormat(d3.time.format("%a"));
		network.Scales.yAxis
			.tickValues(factCountPercentile.map(function(d){return d.val}))
		//Changed parameters above. need to reset the axis
		network.SVG.xAxisG.call(network.Scales.xAxis);
		network.SVG.yAxisG.call(network.Scales.yAxis);

		network.SVG.cells = [];
		factCountPercentile.forEach(function(d, i) {
			ageRange.forEach(function(d1, i1) {
				network.SVG.cells.push({
					age: d1,
					fact: d.val,
					pos: {
						x: i1,
						y: i
					},
					value: data[i1 + (i * (factCountPercentile.length - 1))].val || 0
				});
			});
		});
		
		network.SVG.cellG = network.SVG.graphG.selectAll(".cell")
			.data(network.SVG.cells)
			.enter()
			.append("g")
			.attr("class", function(d, i) {
				return "x" + d.pos.x + " y" + d.pos.y;
			})
			.attr("transform", function(d, i) {
				var x = d.pos.x * network.SVG.graphOpts.cellWidth;
				var y = d.pos.y * network.SVG.graphOpts.cellHeight;
				return "translate(" + x + "," + y + ")";
			})
		network.Scales.colorScale = Utilities.makeDynamicScale(
			data,
			"val",
			"linear",
			["#FE0100", "#FF8000", "#FFCA01", "#FFFF00", "#CBE700", "#7FE601", "#00FF01"]
		);


		network.SVG.cellR = network.SVG.cellG.append("rect")
			.attr("class", function(d, i) {
				return "x" + d.pos.x + " y" + d.pos.y;
			})
			.attr("width", network.SVG.graphOpts.cellWidth - network.SVG.graphOpts.celPadding)
			.attr("height", network.SVG.graphOpts.cellHeight - network.SVG.graphOpts.celPadding)
			.attr("fill", function(d, i) {
				if (d.value) {
					return network.Scales.colorScale(d.value);
				}
				return "grey"
			})
			.on("mouseover", function(d, i) {
				d3.select(this).attr("fill", network.Scales.colorScale(d.value));
				d.value += 1;
			})
		network.SVG.cellT = network.SVG.cellG.append("text")
			.attr("dx", network.SVG.graphOpts.cellWidth - network.SVG.graphOpts.celPadding - network.SVG.graphOpts.celPadding)
			.attr("dy", network.SVG.graphOpts.cellHeight - network.SVG.graphOpts.celPadding / 2 - network.SVG.graphOpts.celPadding)
			.attr("text-anchor", "end")
			.text(function(d, i) {
				return d.value;
			})
	}
	return network;
}