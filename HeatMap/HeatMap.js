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
			useData = network.AngularArgs.data.get("records");

			useData.data = useData.data.sort(function(a, b) {
				var priority = ["L", "@", "H"];
				if (priority.indexOf(a[network.config.meta.records.colAggregator]) > priority.indexOf(b[network.config.meta.records.colAggregator])) {
					return 1
				}
				return -1
			});

			Object.keys(useData.data[0]).forEach(function(d, i) {
				console.log(d + ": " + useData.data[0][d]);
			})

			useData.data.map(function(d, i) {
				if (d.LabHourGroup) {
					d.LabHourGroupStr = d.LabHourGroup.substring(d.LabHourGroup.indexOf("("))
					d.LabHourGroup = parseInt(d.LabHourGroup);
				}
				if (d.LabIntervalGroup) {
					d.LabIntervalGroupStr = d.LabIntervalGroup.substring(d.LabIntervalGroup.indexOf("("))
					d.LabIntervalGroup = parseInt(d.LabIntervalGroup);
				}
			})
			var barScaleValues = [];
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
			barScaleValues.sort();


			var scaleValues = [];
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

			nestedData = nestedData.sort(function(a, b) {
				if (parseInt(a.key) >= parseInt(b.key)) {
					return 1
				};
				return -1
			})
			nestedData.forEach(function(d, i) {
				d.something = network.config.meta.records.rowAggregator
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
					// compareKeyMap.forEach(function(d1, i1) {
					// 	console.log(d.values)
					// 	d.values[d.values.length] = {
					// 		key: d1,
					// 		values: {children:[]}
					// 	}

					// });
				}
				console.log(nestedData);






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
			//TODO: So the color scale is for relative survivability, right? Do the patient counts factor in?
			network.Scales.somethingScale = d3.scale.linear()
				.domain(d3.extent(scaleValues))
				.range([0, 1])

			network.Scales.colorScale = d3.scale.linear()
				.domain([network.Scales.somethingScale.domain()[1], ((network.Scales.somethingScale.domain()[1] + network.Scales.somethingScale.domain()[0]) / 2), network.Scales.somethingScale.domain()[0]])
				.range(["#BA635D", "#F4E98D", "#A2C283"].reverse())

			network.Scales.gridAreaX = d3.scale.linear()
				//TODO: Get groups from column count
				.domain([0, nestedDataOtherDimension.length])
				.range([60, network.config.dims.fixedWidth - 180])
			network.Scales.gridAreaY = d3.scale.linear()
				//TODO: Get groups from row count
				.domain([0, nestedData.length])
				.range([0, network.config.dims.fixedHeight - 180])
			network.Scales.barScale = d3.scale.linear()
				.domain([0, 1])
				// .domain(d3.extent(barScaleValues))
				.range([20, 100])

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
						// .attr("transform", function(d) {
						//     var w = +d3.select(this).attr("x") + (this.getBBox().width / 2);
						//     var h = +d3.select(this).attr("y") + (this.getBBox().height / 2);
						//     return "rotate(-90," + w + "," + (h - 14) + ")";
						// })
						.text(Math.floor(d.NumAlive / d.NumPatients * 10000) / 100 + "%")

					elem.append("text")
						.attr("x", -7)
						.attr("y", network.Scales.gridAreaY(1) / 2 + 3)
						.style("text-anchor", "end")
						.text(d.key)

				})

			var asdf = network.SVG.gArea.append("g").selectAll(".hBars")
				.data(nestedDataOtherDimension)
				.enter()
				.append("g")
				.attr("transform", function(d, i) {
					return "translate(0," + (network.Scales.gridAreaY(nestedData.length)) + ")"
				})



			network.SVG.append("text")
				.attr("x", 0)
				.attr("y", network.config.dims.fixedHeight / 2)
				.attr("transform", function(d) {
					var w = +d3.select(this).attr("x") + (this.getBBox().width / 2);
					var h = +d3.select(this).attr("y") + (this.getBBox().height / 2);
					return "rotate(-90," + w + "," + (h) + ")";
				})
				.style("text-anchor", "middle")
				.text(network.config.meta.labels.yAxis)
			network.SVG.append("text")
				.attr("x", network.config.dims.fixedWidth / 2)
				.attr("y", -60)
				.style("text-anchor", "middle")
				.text(network.config.meta.labels.xAxis)


			asdf.append("text")
				.attr("x", function(d, i) {
					return barWidth * i + (barWidth / 2)
				})
				.attr("y", -(network.Scales.gridAreaY(nestedData.length)) - 7)
				.style("text-anchor", "middle")
				.text(function(d, i) {
					return { "@": "Normal", "H": "High", "L": "Low" }[d.key]
				})


			asdf.append("rect")
				.attr("x", function(d, i) {
					return barWidth * i
				})
				.attr("width", network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length - 3)
				.attr("height", function(d, i) {
					return network.Scales.barScale(d.values.NumAlive / d.values.NumPatients)
				})
				.attr("fill", "#CCCCCC")


			asdf.append("text")
				.attr("x", function(d, i) {
					return barWidth * i + (barWidth / 2)
				})
				.attr("y", 14)
				.style("text-anchor", "middle")
				.text(function(d, i) {

					return Math.floor(d.values.NumAlive / d.values.NumPatients * 10000) / 100 + "%"
				})


			// network.SVG.append("rect")
			//     .attr("x", network.Scales.gridAreaX(0))
			//     .attr("y", network.Scales.gridAreaY(nestedData.length))
			//     .attr("width", network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length - 3)
			//     .attr("height", 20)
			//     .attr("fill", "#CCCCCC")
			// network.SVG.append("text")
			//     .attr("x", network.Scales.gridAreaX(.5))
			//     .attr("y", network.Scales.gridAreaY(nestedData.length) + 14)
			//     .style("text-anchor", "middle")
			//     .text("ASDF")
			// network.SVG.append("rect")
			//     .attr("x", network.Scales.gridAreaX(1) + 7)
			//     .attr("y", network.Scales.gridAreaY(nestedData.length))
			//     .attr("width", network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length - 3)
			//     .attr("height", 20)
			//     .attr("fill", "#CCCCCC")
			// network.SVG.append("text")
			//     .attr("x", network.Scales.gridAreaX(1.5))
			//     .attr("y", network.Scales.gridAreaY(nestedData.length) + 14)
			//     .style("text-anchor", "middle")
			//     .text("ASDF")
			// network.SVG.append("rect")
			//     .attr("x", network.Scales.gridAreaX(2) + 13)
			//     .attr("y", network.Scales.gridAreaY(nestedData.length))
			//     .attr("width", network.Scales.gridAreaX(nestedDataOtherDimension.length) / nestedDataOtherDimension.length - 3)
			//     .attr("height", 20)
			//     .attr("fill", "#CCCCCC")
			// network.SVG.append("text")
			//     .attr("x", network.Scales.gridAreaX(2.5))
			//     .attr("y", network.Scales.gridAreaY(nestedData.length) + 14)
			//     .style("text-anchor", "middle")
			//     .text("ASDF")






			// useData.data.map(function(d, i) {
			//     d.LabHourGroupStr = d.LabHourGroup.substring(d.LabHourGroup.indexOf("("))
			//     d.LabHourGroup = parseInt(d.LabHourGroup);
			// })
			// var nestedData = d3.nest()
			//     .key(function(d) {
			//         return d.LabHourGroupStr
			//     })
			//     .key(function(d) {
			//         return d.Sex
			//     })
			//     .key(function(d) {
			//         return d.LabFlag
			//     })
			//     .rollup(function(leaves) {
			//         var obj = { children: leaves };
			//         useData.schema.forEach(function(d) {
			//             if (d.type == "numeric") {
			//                 obj[d.name] = d3.sum(leaves, function(d1) {
			//                     return d1[d.name];
			//                 })
			//             }
			//         })
			//         return obj;
			//     })
			//     .entries(useData.data);


			// var timeSurvival = [];
			// var sexSurvival = [];
			// var colorRange = [];
			// nestedData.forEach(function(d, i) {
			//     //Makes unique time groups
			//     d["L"] = {
			//         total: 0,
			//         alive: 0
			//     };
			//     d["@"] = {
			//         total: 0,
			//         alive: 0
			//     };
			//     d["H"] = {
			//         total: 0,
			//         alive: 0
			//     };
			//     d.values.forEach(function(d1, i1) {
			//         d1["pre"] = {
			//             total: 0,
			//             alive: 0
			//         };
			//         d1.values.forEach(function(d2, i2) {
			//             d2.survivalP = (d2.values.NumAlive / d2.values.NumPatients) * 100;

			//             colorRange.push(d2.survivalP)
			//                 //Avoid d3
			//             d2.values.children.forEach(function(d4, i4) {
			//                 d[d4.LabFlag].total += d4.NumPatients
			//                 d[d4.LabFlag].alive += d4.NumAlive
			//                 d1.pre.total += d4.NumPatients
			//                 d1.pre.alive += d4.NumAlive
			//             })
			//         })
			//         d1.p = Math.floor(d1.pre.alive / d1.pre.total * 10000) / 100 || "null"
			//         sexSurvival.push(d1.p)
			//     });
			//     d["L"].p = Math.floor(d["L"].alive / d["L"].total * 10000) / 100 || "null"
			//     d["@"].p = Math.floor(d["@"].alive / d["@"].total * 10000) / 100 || "null"
			//     d["H"].p = Math.floor(d["H"].alive / d["H"].total * 10000) / 100 || "null"
			//     d.p = (d["L"].alive + d["@"].alive + d["H"].alive) / (d["L"].total + d["@"].total + d["H"].total)
			//     timeSurvival.push(d.p);
			// })
			// var w = network.config.dims.fixedWidth;
			// var h = network.config.dims.fixedHeight;
			// var s = Math.min(w, h) - 30;
			// var hs = s * .8;
			// var ch = s * .8 / (nestedData.length * nestedData[0].values.length) * 2;
			// var cw = s * .8 / (nestedData[0].values[0].values.length);
			// var tsS = d3.scale.linear()
			//     .domain([0, d3.max(timeSurvival)])
			//     .range([20, s * .2 + 20])
			// var ssS = d3.scale.linear()
			//     .domain([0, d3.max(sexSurvival)])
			//     .range([20, s * .2 + 20])

			// var colS = Utilities.makeDynamicScale(colorRange, "", "linear", ["#DD746F", "#F5ED8A", "#93C180"])
			// network.SVG.group = network.SVG.selectAll("group")
			//     .data(nestedData)
			//     .enter()
			//     .append("g")
			//     .attr("class", "time")
			//     .attr("transform", "translate(150,50)")
			//     .each(function(d, i) {
			//         var elem = d3.select(this);
			//         d.values.forEach(function(d1, i1) {
			//             var sexgroup = elem.append("g")
			//                 .attr("transform", "translate(0," + (i * (ch)) + ")")
			//             d1.values.forEach(function(d2, i2) {
			//                 sexgroup.append("rect")
			//                     .attr("x", i2 * cw)
			//                     .attr("y", i1 * ch / 2)
			//                     .attr("width", cw - 2)
			//                     .attr("height", ch / 2 - 2)
			//                     .attr("fill", colS(d2.survivalP))
			//                 sexgroup.append("text")
			//                     .attr("x", i2 * cw + cw / 2)
			//                     .attr("y", i1 * ch / 2 + ch / 4)
			//                     .style("text-anchor", "middle")
			//                     .text(Math.floor(d2.values.NumAlive / d2.values.NumPatients * 10000) / 100 + "%")
			//             })
			//             sexgroup.append("text")
			//                 .attr("x", -20)
			//                 .attr("y", ch / 2 * i1 + ch / 4)
			//                 .text(d1.key)

			//             sexgroup.append("rect")
			//                 .attr("x", cw * d1.values.length)
			//                 .attr("y", i1 * ch / 2)
			//                 .attr("width", ssS(d1.p))
			//                 .attr("height", ch / 2 - 2)
			//                 // .attr("fill", ["#26A9E1", "#C369C9"].reverse()[i1])
			//                 .attr("fill", "light#CCCCCC")
			//             sexgroup.append("text")
			//                 .attr("x", cw * d1.values.length + 10)
			//                 .attr("y", i1 * ch / 2 + ch / 4)
			//                 .text(Math.floor(d.p * 10000) / 100 + "%")
			//         })
			//         elem.append("rect")
			//             .attr("x", cw * i)
			//             .attr("y", ch * d.values[0].values.length)
			//             .attr("width", cw - 2)
			//             .attr("height", tsS(d.p))
			//             .attr("fill", "light#CCCCCC")
			//         elem.append("text")
			//             .attr("x", cw * i + cw / 2)
			//             .attr("y", ch * d.values[0].values.length + 20)
			//             .style("text-anchor", "middle")
			//          .text(Math.floor(d.p * 10000) / 100 + "%")
			//         elem.append("text")
			//             .attr("x", cw * i + cw / 2)
			//             .attr("y", -10)
			//             .style("text-anchor", "middle")
			//             .text(["Low", "Normal", "High"][i])


			//         elem.append("text")
			//             .attr("x", -60)
			//             .attr("y", ch * i + ch / 2)
			//             .style("text-anchor", "middle")
			//          .text(d.key)
			//     })
		}
		return network;
	}
	// visualizationFunctions.HeatMap = function(element, data, opts) {
	//  var network = visualizations[opts.ngIdentifier];
	//  network.parentVis = visualizations[opts.ngComponentFor];
	//  network.config = network.CreateBaseConfig();
	//  network.meta = network.config.meta;

//  network.SVG = network.config.easySVG(element[0])
//      .attr("background", "white")
//      .attr("class", "canvas " + opts.ngIdentifier)
//      .append("g")
//      .attr("transform", "translate(" + network.config.margins.left + "," + network.config.margins.top + ")");
//  network.VisFunc = function() {
//      var data = network.AngularArgs.data.get("records").data;
//      Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
//      //TODO: Get these from data when we get the data
//      var yAxisCellData = createAxisCellData(10);
//      var xAxisCellData = createAxisCellData(9);
//      createScales();
//      createGraphLayout(xAxisCellData, yAxisCellData);
//      createCells(xAxisCellData, yAxisCellData);
//      renderCells();
//      var xAxisBarData = createBarData(90, 10, 100);
//      var yAxisBarData = createBarData(80, 9, 100);
//      var nestedTempXData = manipulateTempData(xAxisBarData);
//      var nestedTempYData = manipulateTempData(yAxisBarData);



//      network.Scales.asdf = Utilities.makeDynamicScale(
//          nestedTempXData,
//          function(d) {
//              return d.values.totalVal
//          },
//          "linear", ["#51b7e5", "#92b8e2", "#756bb0"])
//      network.Scales.qwerty = Utilities.makeDynamicScale(
//          nestedTempXData,
//          function(d) {
//              return d.values.totalVal
//          },
//          "linear", ["#51b7e5", "#92b8e2", "#756bb0"])


//      nestedTempXData.forEach(function(d, i) {
//          network.Scales.qwop = d3.scale.linear().domain(d3.extent(d.values.children, function(d, i) {
//              return d.val
//          })).range([.50, 1])
//          network.SVG.graphG.append("g")
//              .attr("class", "barX" + i)
//              .selectAll(".bar")
//              .data(d.values.children)
//              .enter()
//              .append("rect")
//              .attr("class", function(d1, i1) {
//                  return "y" + i
//              })
//              .attr("x", function(d1, i1) {
//                  return network.SVG.CellH * 9 + network.SVG.graphOpts.celPadding * 9 + network.SVG.graphOpts.celPadding
//              })
//              .attr("y", function(d1, i1) {
//                  return ((network.SVG.CellV + network.SVG.graphOpts.celPadding) * i) + (network.SVG.CellV / d.values.children.length) * i1 + network.SVG.graphOpts.celPadding
//              })
//              .attr("width", function(d1, i1) {
//                  return d1.val
//              })
//              .attr("height", function(d1, i1) {
//                  return network.SVG.CellV / d.values.children.length - network.SVG.graphOpts.celPadding
//              })
//              .attr("fill", function(d1, i1) {
//                  return network.Scales.asdf(d.values.totalVal)
//              })
//              .attr("opacity", function(d1, i1) {
//                  return network.Scales.qwop(d1.val)
//              })
//      })

//      nestedTempYData.forEach(function(d, i) {
//          network.Scales.zxcv = d3.scale.linear().domain(d3.extent(d.values.children, function(d, i) {
//              return d.val
//          })).range([.50, 1])
//          network.SVG.graphG.append("g")
//              .attr("class", "barY" + i)
//              .selectAll(".bar")
//              .data(d.values.children)
//              .enter()
//              .append("rect")
//              .attr("class", function(d1, i1) {
//                  return "x" + i
//              })
//              .attr("x", function(d1, i1) {
//                  return ((network.SVG.CellH + network.SVG.graphOpts.celPadding) * i) + (network.SVG.CellH / nestedTempYData.length) * i1 + network.SVG.graphOpts.celPadding + network.SVG.graphOpts.celPadding
//              })
//              .attr("y", function(d1, i1) {
//                  return network.SVG.CellV * 10 + network.SVG.graphOpts.celPadding * 10
//              })
//              .attr("width", function(d1, i1) {
//                  return network.SVG.CellH / nestedTempYData.length - network.SVG.graphOpts.celPadding
//              })
//              .attr("height", function(d1, i1) {
//                  return d1.val
//              })
//              .attr("fill", function(d1, i1) {
//                  return network.Scales.qwerty(d.values.totalVal)
//              })
//              .attr("opacity", function(d1, i1) {
//                  return network.Scales.zxcv(d1.val)
//              })
//      })

//      function createBarData(j, k, rand) {
//          var arr = [];
//          for (var i = 0; i < j; i++) {
//              arr.push({
//                  "val": Math.floor(Math.random() * 80) + 4,
//                  "group": i % k
//              })
//          }
//          return arr;
//      }

//      function renderCells() {
//          network.SVG.CellH = network.SVG.graphOpts.cellWidth - network.SVG.graphOpts.celPadding;
//          network.SVG.CellV = network.SVG.graphOpts.cellHeight - network.SVG.graphOpts.celPadding;

//          network.SVG.cellR = network.SVG.cellG.append("rect")
//              .attr("class", function(d, i) {
//                  return "x" + d.pos.x + " y" + d.pos.y;
//              })
//              .attr("width", network.SVG.CellH)
//              .attr("height", network.SVG.CellV)
//              .attr("fill", function(d, i) {
//                  if (d.value) {
//                      return network.Scales.colorScale(d.value);
//                  }
//                  return "#CCCCCC"
//              })
//              .on("mouseover", function(d, i) {
//                  d3.select(this).attr("fill", network.Scales.colorScale(d.value));
//              })
//          network.SVG.cellT = network.SVG.cellG.append("text")
//              .attr("dx", network.SVG.CellH - network.SVG.graphOpts.celPadding)
//              .attr("dy", network.SVG.CellV / 2 - network.SVG.graphOpts.celPadding)
//              .attr("text-anchor", "end")
//              .text(function(d, i) {
//                  return d.value;
//              })
//      }

//      function createScales() {
//          network.Scales.colorScale = Utilities.makeDynamicScale(
//              data,
//              "val",
//              "linear", ["#E14728", "#FAAD61", "#F9D46B", "#ADD7A3", "#40B18A"]
//          );
//      }

//      function manipulateTempData(d) {
//          return d3.nest()
//              .key(function(d) {
//                  return d.group
//              })
//              .rollup(function(leaves) {
//                  var obj = {
//                      children: leaves
//                  };
//                  obj.totalVal = d3.sum(leaves, function(d1) {
//                      return d1.val
//                  })
//                  obj.maxVal = d3.max(leaves, function(d1) {
//                      return d1.val
//                  })
//                  obj.minVal = d3.min(leaves, function(d1) {
//                      return d1.val
//                  })
//                  return obj;
//              })
//              .entries(d);
//      }

//      function createCells(xData, yData) {
//          network.SVG.cells = [];
//          yData.forEach(function(d, i) {
//              xData.forEach(function(d1, i1) {
//                  network.SVG.cells.push({
//                      age: d1,
//                      fact: d.val,
//                      pos: {
//                          x: i1,
//                          y: i
//                      },
//                      value: data[i1 + (i * (yData.length - 1))].val || 0
//                  });
//              });
//          });

//          network.SVG.cellG = network.SVG.graphG.selectAll(".cell")
//              .data(network.SVG.cells)
//              .enter()
//              .append("g")
//              .attr("class", function(d, i) {
//                  return "x" + d.pos.x + " y" + d.pos.y;
//              })
//              .attr("transform", function(d, i) {
//                  var x = d.pos.x * network.SVG.graphOpts.cellWidth + network.SVG.graphOpts.celPadding;
//                  var y = d.pos.y * network.SVG.graphOpts.cellHeight + network.SVG.graphOpts.celPadding;
//                  return "translate(" + x + "," + y + ")";
//              })
//      }

//      function createGraphLayout(xData, yData) {
//          network.Scales.x = d3.scale.linear().domain(d3.extent(yData, function(d, i) {
//              return d.val
//          }))
//          network.config.easyGraphLayout(network);
//          //So this is celPadding because cellPadding seems reserved. Gonna just avoid it. 
//          network.SVG.graphOpts.celPadding = 1;
//          network.SVG.graphOpts.cellWidth = network.SVG.graphOpts.width / yData.length;
//          network.SVG.graphOpts.cellHeight = network.SVG.graphOpts.height / yData.length;
//          network.Scales.y = Utilities.makeDynamicScale(yData, "val", "linear", [network.SVG.graphOpts.height - network.SVG.graphOpts.cellHeight / 2, network.SVG.graphOpts.cellHeight / 2])
//          network.Scales.x1 = d3.scale.linear()
//              .domain(network.Scales.x.domain())
//          network.Scales.y1 = d3.scale.linear()
//              .domain(network.Scales.y.domain())

//          network.config.easyGraph(network, {
//              x: {
//                  scale1: network.Scales.x,
//                  scale2: network.Scales.x1,
//                  orient: "top",
//                  label: "SomethingX"
//              },
//              y: {
//                  scale1: network.Scales.y,
//                  scale2: network.Scales.y1,
//                  orient: "left",
//                  label: "SomethingY"
//              },
//              t: {
//                  orient: "top",
//                  label: opts.ngDataField
//              }
//          });

//          network.Scales.xAxis
//              .tickSize(5)
//              .ticks(7)
//              //  .tickFormat(d3.time.format("%a"));
//          network.Scales.yAxis
//              .tickValues(yData.map(function(d) {
//                  return d.val
//              }))
//              //Changed parameters above. need to reset the axis
//          network.SVG.xAxisG.call(network.Scales.xAxis);
//          network.SVG.yAxisG.call(network.Scales.yAxis);
//          network.SVG.selectAll(".axis").remove();
//      }

//      function createAxisCellData(j) {
//          var arr = [];
//          for (var i = 0; i < j; i++) {
//              arr.push({
//                  val: i * 10 + 5
//              })
//          }
//          return arr;
//      }
//  }
//  return network;
// }
