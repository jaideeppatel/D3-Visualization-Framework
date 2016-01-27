visualizationFunctions.HeatMap = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.meta = network.config.meta;

	network.SVG = network.config.easySVG(element[0])
		.attr("background", "white")
		.attr("class", "canvas " + opts.ngIdentifier)
		.append("g")
		.attr("transform", "translate(" + network.config.margins.left + "," + network.config.margins.top + ")");
	network.VisFunc = function() {
		var data = network.AngularArgs.data.get("records").data;
		Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
		//TODO: Get these from data when we get the data
		var factCountPercentile = [{
			val: 5
		}, {
			val: 15
		}, {
			val: 25
		}, {
			val: 35
		}, {
			val: 45
		}, {
			val: 55
		}, {
			val: 65
		}, {
			val: 75
		}, {
			val: 85
		}, {
			val: 95
		}];
		var ageRange = [{
			val: 5
		}, {
			val: 15
		}, {
			val: 25
		}, {
			val: 35
		}, {
			val: 45
		}, {
			val: 55
		}, {
			val: 65
		}, {
			val: 75
		}, {
			val: 85
		}];
		network.Scales.x = d3.scale.linear().domain(d3.extent(ageRange, function(d, i) {
			return d.val
		}))

		network.config.easyGraphLayout(network);
		//So this is celPadding because cellPadding seems reserved. Gonna just avoid it. 
		network.SVG.graphOpts.celPadding = 1;
		network.SVG.graphOpts.cellWidth = network.SVG.graphOpts.width / ageRange.length;
		network.SVG.graphOpts.cellHeight = network.SVG.graphOpts.height / factCountPercentile.length;

		network.Scales.y = Utilities.makeDynamicScale(factCountPercentile, "val", "linear", [network.SVG.graphOpts.height - network.SVG.graphOpts.cellHeight / 2, network.SVG.graphOpts.cellHeight / 2])
		network.Scales.x1 = d3.scale.linear()
			.domain(network.Scales.x.domain())
		network.Scales.y1 = d3.scale.linear()
			.domain(network.Scales.y.domain())

		network.config.easyGraph(network, {
			x: {
				scale1: network.Scales.x,
				scale2: network.Scales.x1,
				orient: "top",
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
			.tickValues(factCountPercentile.map(function(d) {
				return d.val
			}))
			//Changed parameters above. need to reset the axis
		network.SVG.xAxisG.call(network.Scales.xAxis);
		network.SVG.yAxisG.call(network.Scales.yAxis);
		network.SVG.selectAll(".axis").remove();
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
				var x = d.pos.x * network.SVG.graphOpts.cellWidth + 2;
				var y = d.pos.y * network.SVG.graphOpts.cellHeight + 1;
				return "translate(" + x + "," + y + ")";
			})
		network.Scales.colorScale = Utilities.makeDynamicScale(
			data,
			"val",
			"linear", ["#FE0100", "#FF8000", "#FFCA01", "#FFFF00", "#CBE700", "#7FE601", "#00FF01"]
		);

		var cellH = network.SVG.graphOpts.cellWidth - network.SVG.graphOpts.celPadding;
		var cellV = network.SVG.graphOpts.cellHeight - network.SVG.graphOpts.celPadding;

		// var tempData = {};
		// for (var i = 0; i < 10; i++) {
		// 	tempData[i] = [];
		// 	for (var j = 0; j < 9; j++) {
		// 		tempData[i].push({
		// 			"val": Math.floor(Math.random() * 24) + 4
		// 		})
		// 	}
		// }
		// var tempData2 = {};
		// for (var i = 0; i < 9; i++) {
		// 	tempData2[i] = [];
		// 	for (var j = 0; j < 9; j++) {
		// 		tempData2[i].push({
		// 			"val": Math.floor(Math.random() * 24) + 4
		// 		})
		// 	}
		// }		


		// console.log(tempData);

		var tempXData = [];
		for (var i = 0; i < 90; i++) {
			tempXData.push({
				"val": Math.floor(Math.random() * 80) + 4,
				"group": i % 10
			})
		}

		var nestedTempXData = d3.nest()
			.key(function(d) {
				return d.group
			})
			.rollup(function(leaves) {
				var obj = {
					children: leaves
				};
				obj.totalVal = d3.sum(leaves, function(d1) {
					return d1.val
				})
				obj.maxVal = d3.max(leaves, function(d1) {
					return d1.val
				})
				obj.minVal = d3.min(leaves, function(d1) {
					return d1.val
				})
				return obj;
			})
			.entries(tempXData);
		console.log(nestedTempXData)

		var tempYData = [];
		for (var i = 0; i < 80; i++) {
			tempYData.push({
				"val": Math.floor(Math.random() * 80) + 4,
				"group": i % 9
			})
		}

		var nestedTempYData = d3.nest()
			.key(function(d) {
				return d.group
			})
			.rollup(function(leaves) {
				var obj = {
					children: leaves
				};
				obj.totalVal = d3.sum(leaves, function(d1) {
					return d1.val
				})
				obj.maxVal = d3.max(leaves, function(d1) {
					return d1.val
				})
				obj.minVal = d3.min(leaves, function(d1) {
					return d1.val
				})
				return obj;
			})
			.entries(tempYData);



		var barXColor = d3.scale.linear().domain(d3.extent(nestedTempXData, function(d, i) {
			return d.values.totalVal
		})).range(["#0000ff", "#ffa500"])
		var barYColor = d3.scale.linear().domain(d3.extent(nestedTempYData, function(d, i) {
			return d.values.totalVal
		})).range(["#0000ff", "#ffa500"])
		nestedTempXData.forEach(function(d, i) {
			var something = d3.scale.linear().domain(d3.extent(d.values.children, function(d, i) {
				return d.val
			})).range([.25, 1])			
			network.SVG.graphG.selectAll("asdf")
				.data(d.values.children)
				.enter()
				.append("rect")
				.attr("class", function(d1, i1) {
					return "bar y" + i
				})				
				.attr("x", function(d1, i1) {
					return cellH * 9 + network.SVG.graphOpts.celPadding * 9 + 1
				})
				.attr("y", function(d1, i1) {
					return ((cellV + network.SVG.graphOpts.celPadding) * i) + (cellV / d.values.children.length) * i1 + network.SVG.graphOpts.celPadding
				})
				.attr("width", function(d1, i1) {
					return d1.val
				})
				.attr("height", function(d1, i1) {
					return cellV / d.values.children.length - 1
				})
				.attr("fill", function(d1, i1) {
					return barXColor(d.values.totalVal)
				})
				.attr("opacity", function(d1, i1) {
					return something(d1.val)
				})
		})

		nestedTempYData.forEach(function(d, i) {
			var something = d3.scale.linear().domain(d3.extent(d.values.children, function(d, i) {
				return d.val
			})).range([.25, 1])				
			network.SVG.graphG.selectAll("asdf")
				.data(d.values.children)
				.enter()
				.append("rect")
				.attr("class", function(d1, i1) {
					return "bar x" + i
				})				
				.attr("x", function(d1, i1) {
					return ((cellH + network.SVG.graphOpts.celPadding) * i) + (cellH / nestedTempYData.length) * i1 + network.SVG.graphOpts.celPadding + 1
				})
				.attr("y", function(d1, i1) {
					return cellV * 10 + network.SVG.graphOpts.celPadding * 10
				})
				.attr("width", function(d1, i1) {
					return cellH / nestedTempYData.length - 1
				})
				.attr("height", function(d1, i1) {
					return d1.val
				})
				.attr("fill", function(d1, i1) {
					return barXColor(d.values.totalVal)
				})
				.attr("opacity", function(d1, i1) {
					return something(d1.val)
				})
		})



		network.SVG.cellL = network.SVG.cellG.append("g")


		network.SVG.cellR = network.SVG.cellG.append("rect")
			.attr("class", function(d, i) {
				return "x" + d.pos.x + " y" + d.pos.y;
			})
			.attr("width", cellH)
			.attr("height", cellV)
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
			.attr("dx", cellH - network.SVG.graphOpts.celPadding)
			.attr("dy", cellV / 2 - network.SVG.graphOpts.celPadding)
			.attr("text-anchor", "end")
			.text(function(d, i) {
				return d.value;
			})
	}
	return network;
}