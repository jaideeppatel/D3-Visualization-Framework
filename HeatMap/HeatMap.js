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
		var yAxisCellData = createAxisCellData(10);
		var xAxisCellData = createAxisCellData(9);
		createScales();
		createGraphLayout(xAxisCellData, yAxisCellData);
		createCells(xAxisCellData, yAxisCellData);
		renderCells();
		var xAxisBarData = createBarData(90, 10, 100);
		var yAxisBarData = createBarData(80, 9, 100);
		var nestedTempXData = manipulateTempData(xAxisBarData);
		var nestedTempYData = manipulateTempData(yAxisBarData);



		network.Scales.asdf = Utilities.makeDynamicScale(
			nestedTempXData,
			function(d) {
				return d.values.totalVal
			},
			"linear", ["#51b7e5", "#92b8e2", "#756bb0"])
		network.Scales.qwerty = Utilities.makeDynamicScale(
			nestedTempXData,
			function(d) {
				return d.values.totalVal
			},
			"linear", ["#51b7e5", "#92b8e2", "#756bb0"])


		nestedTempXData.forEach(function(d, i) {
			network.Scales.qwop = d3.scale.linear().domain(d3.extent(d.values.children, function(d, i) {
				return d.val
			})).range([.50, 1])
			network.SVG.graphG.append("g")
				.attr("class", "barX" + i)
				.selectAll(".bar")
				.data(d.values.children)
				.enter()
				.append("rect")
				.attr("class", function(d1, i1) {
					return "y" + i
				})
				.attr("x", function(d1, i1) {
					return network.SVG.CellH * 9 + network.SVG.graphOpts.celPadding * 9 + network.SVG.graphOpts.celPadding
				})
				.attr("y", function(d1, i1) {
					return ((network.SVG.CellV + network.SVG.graphOpts.celPadding) * i) + (network.SVG.CellV / d.values.children.length) * i1 + network.SVG.graphOpts.celPadding
				})
				.attr("width", function(d1, i1) {
					return d1.val
				})
				.attr("height", function(d1, i1) {
					return network.SVG.CellV / d.values.children.length - network.SVG.graphOpts.celPadding
				})
				.attr("fill", function(d1, i1) {
					return network.Scales.asdf(d.values.totalVal)
				})
				.attr("opacity", function(d1, i1) {
					return network.Scales.qwop(d1.val)
				})
		})

		nestedTempYData.forEach(function(d, i) {
			network.Scales.zxcv = d3.scale.linear().domain(d3.extent(d.values.children, function(d, i) {
				return d.val
			})).range([.50, 1])
			network.SVG.graphG.append("g")
				.attr("class", "barY" + i)
				.selectAll(".bar")
				.data(d.values.children)
				.enter()
				.append("rect")
				.attr("class", function(d1, i1) {
					return "x" + i
				})
				.attr("x", function(d1, i1) {
					return ((network.SVG.CellH + network.SVG.graphOpts.celPadding) * i) + (network.SVG.CellH / nestedTempYData.length) * i1 + network.SVG.graphOpts.celPadding + network.SVG.graphOpts.celPadding
				})
				.attr("y", function(d1, i1) {
					return network.SVG.CellV * 10 + network.SVG.graphOpts.celPadding * 10
				})
				.attr("width", function(d1, i1) {
					return network.SVG.CellH / nestedTempYData.length - network.SVG.graphOpts.celPadding
				})
				.attr("height", function(d1, i1) {
					return d1.val
				})
				.attr("fill", function(d1, i1) {
					return network.Scales.qwerty(d.values.totalVal)
				})
				.attr("opacity", function(d1, i1) {
					return network.Scales.zxcv(d1.val)
				})
		})

		function createBarData(j, k, rand) {
			var arr = [];
			for (var i = 0; i < j; i++) {
				arr.push({
					"val": Math.floor(Math.random() * 80) + 4,
					"group": i % k
				})
			}
			return arr;
		}

		function renderCells() {
			network.SVG.CellH = network.SVG.graphOpts.cellWidth - network.SVG.graphOpts.celPadding;
			network.SVG.CellV = network.SVG.graphOpts.cellHeight - network.SVG.graphOpts.celPadding;

			network.SVG.cellR = network.SVG.cellG.append("rect")
				.attr("class", function(d, i) {
					return "x" + d.pos.x + " y" + d.pos.y;
				})
				.attr("width", network.SVG.CellH)
				.attr("height", network.SVG.CellV)
				.attr("fill", function(d, i) {
					if (d.value) {
						return network.Scales.colorScale(d.value);
					}
					return "grey"
				})
				.on("mouseover", function(d, i) {
					d3.select(this).attr("fill", network.Scales.colorScale(d.value));
				})
			network.SVG.cellT = network.SVG.cellG.append("text")
				.attr("dx", network.SVG.CellH - network.SVG.graphOpts.celPadding)
				.attr("dy", network.SVG.CellV / 2 - network.SVG.graphOpts.celPadding)
				.attr("text-anchor", "end")
				.text(function(d, i) {
					return d.value;
				})
		}

		function createScales() {
			network.Scales.colorScale = Utilities.makeDynamicScale(
				data,
				"val",
				"linear", ["#E14728", "#FAAD61", "#F9D46B", "#ADD7A3", "#40B18A"]
			);
		}

		function manipulateTempData(d) {
			return d3.nest()
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
				.entries(d);
		}

		function createCells(xData, yData) {
			network.SVG.cells = [];
			yData.forEach(function(d, i) {
				xData.forEach(function(d1, i1) {
					network.SVG.cells.push({
						age: d1,
						fact: d.val,
						pos: {
							x: i1,
							y: i
						},
						value: data[i1 + (i * (yData.length - 1))].val || 0
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
					var x = d.pos.x * network.SVG.graphOpts.cellWidth + network.SVG.graphOpts.celPadding;
					var y = d.pos.y * network.SVG.graphOpts.cellHeight + network.SVG.graphOpts.celPadding;
					return "translate(" + x + "," + y + ")";
				})
		}

		function createGraphLayout(xData, yData) {
			network.Scales.x = d3.scale.linear().domain(d3.extent(yData, function(d, i) {
				return d.val
			}))
			network.config.easyGraphLayout(network);
			//So this is celPadding because cellPadding seems reserved. Gonna just avoid it. 
			network.SVG.graphOpts.celPadding = 1;
			network.SVG.graphOpts.cellWidth = network.SVG.graphOpts.width / yData.length;
			network.SVG.graphOpts.cellHeight = network.SVG.graphOpts.height / yData.length;
			network.Scales.y = Utilities.makeDynamicScale(yData, "val", "linear", [network.SVG.graphOpts.height - network.SVG.graphOpts.cellHeight / 2, network.SVG.graphOpts.cellHeight / 2])
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
				//  .tickFormat(d3.time.format("%a"));
			network.Scales.yAxis
				.tickValues(yData.map(function(d) {
					return d.val
				}))
				//Changed parameters above. need to reset the axis
			network.SVG.xAxisG.call(network.Scales.xAxis);
			network.SVG.yAxisG.call(network.Scales.yAxis);
			network.SVG.selectAll(".axis").remove();
		}

		function createAxisCellData(j) {
			var arr = [];
			for (var i = 0; i < j; i++) {
				arr.push({
					val: i * 10 + 5
				})
			}
			return arr;
		}
	}
	return network;
}