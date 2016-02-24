visualizationFunctions.MapOfScience = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.SVG = d3.select(element[0])
		.append("svg")
		.attr("width", network.config.dims.width)
		.attr("height", network.config.dims.height)
		.call(d3.behavior.zoom()
			.scaleExtent([1, 10])
			.on("zoom", function() {
				network.SVG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			}))
		.append("g")
		.attr("class", "canvas " + opts.ngIdentifier)


	network.VisFunc = function() {
		var useData = network.GetData()[network.PrimaryDataAttr].data;
		if (!opts.ngDataField) {
			useData = network.parentVis.GetData()[network.parentVis.PrimaryDataAttr].data;
			network.Scales = network.parentVis.Scales;
			if (!network.config.meta) {
				network.config.meta = network.parentVis.config.meta;
			}
		}

		network.nestedData = nestData();
		createNetworkScales();
		network.SVG.underlyingNodes = createNodes();
		applyDataToUnderlyingMap();
		network.SVG.underlyingLabels = createLabels();
		network.SVG.bundledEdges = bundleEdges();
		network.SVG.bundlePathFunction = createLineFunc();
		network.SVG.underlyingEdgesG = createEdgesG(network.SVG.bundledEdges);
		network.SVG.underlyingEdges = network.SVG.underlyingEdgesG.selectAll("path");

		debugClasses(network.SVG.underlyingNodes)
		debugClasses(network.SVG.underlyingEdges)
		debugClasses(network.SVG.underlyingLabels)

		function debugClasses(selector) {
			selector.on("mouseover.debugClasses", function(d, i) {
				document.getElementById("class-panel").innerHTML = d3.select(this).attr("class");
			}).on("mouseout.debugClasses", function(d, i) {
				document.getElementById("class-panel").innerHTML = "";
			})
		}

		network.SVG.underlyingNodes.moveToFront();
		network.SVG.underlyingLabels.moveToFront();

		function applyDataToUnderlyingMap() {
			network.nestedData.sub_disc.forEach(function(d, i) {
				network.SVG.underlyingNodes.filter(".subd_id" + d.key)
					.attr("r", network.Scales.sizeScale(d.values[network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr]))
			});
		}

		function bundleEdges() {
			var underlyingScimapDataNodesObj = {};
			underlyingScimapData.nodes.map(function(d, i) {
				underlyingScimapDataNodesObj[d.subd_id] = {
					x: d.x,
					y: d.y,
					subd_id: d.subd_id,
					disc_id: d.disc_id
				}
			})
			underlyingScimapData.edges.map(function(d, i) {
				d.source = "" + d.subd_id1 + ""
				d.target = "" + d.subd_id2 + ""
			})

			
			var fbundling = d3.ForceEdgeBundling()
			Object.keys(network.config.meta.visualization.bundleOpts).forEach(function(d, i) {
				if (network.config.meta.visualization.bundleOpts[d]) {
					fbundling[d](network.config.meta.visualization.bundleOpts[d]);
				}
			})
			fbundling
				.nodes(underlyingScimapDataNodesObj)
				.edges(underlyingScimapData.edges);
			return fbundling(["subd_id1", "subd_id2"]);
		}

		function createEdgesG(results) {
			underlyingEdgesG = network.SVG.append("g")
			for (var i = 0; i < results.length; i++) {
				underlyingEdgesG
					.append("path")
					.attr("class", function(d) {
						var sourceNode = d3.select(network.SVG.underlyingNodes.filter(".subd_id" + results[i][0].subd_id1)).node().data()[0];
						var targetNode = d3.select(network.SVG.underlyingNodes.filter(".subd_id" + results[i][0].subd_id2)).node().data()[0];
						return "e subd_id1" + results[i][0].subd_id1 + " subd_id2" + results[i][0].subd_id2 + " disc_id_s" + sourceNode.disc_id + " disc_id_t" + targetNode.disc_id;
					})
					.attr("d", network.SVG.bundlePathFunction(results[i]))
					.style("stroke-width", 1.5)
					.style("stroke", "#000")
					.style("fill", "none")
					.style('opacity', .2);
			}
			return underlyingEdgesG;
		}

		function createLabels() {
			return network.SVG.selectAll(".underlyingLabels")
				.data(underlyingScimapData.labels)
				.enter()
				.append("text")
				.attr("class", "l")
				.attr("x", function(d, i) {
					return network.Scales.translateX(d.x);
				})
				.attr("y", function(d, i) {
					return network.Scales.translateY(d.y);
				})
				.attr("text-anchor", function(d, i) {
					var x = d3.select(this).attr("x");
					var m = d3.mean(network.Scales.translateX.range())
					if (x > m) {
						return "end";
					} else if (x < m) {
						return "start";
					}
					return "middle"
				})
				.text(function(d, i) {
					return d.disc_name;
				})
		}

		function createLineFunc() {
			return d3.svg.line().x(function(d, i) {
				return network.Scales.translateX(d.x);
			}).y(function(d) {
				return network.Scales.translateY(d.y);
			}).interpolate("basis");
		}

		function createNetworkScales() {
			network.Scales.translateX = d3.scale.linear()
				.domain(d3.extent(underlyingScimapData.nodes, function(d) {
					return d.x
				}))
				.range([10, network.config.dims.fixedWidth - 10])
			network.Scales.translateY = d3.scale.linear()
				.domain(d3.extent(underlyingScimapData.nodes, function(d) {
					return d.y
				}))
				.range([network.config.dims.fixedHeight - 10, 10])
			network.Scales.sizeScale = d3.scale.linear()
				.domain(d3.extent(network.nestedData.sub_disc, function(d) {
					return d.values[network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr]
				}))
				.range([5, 16])
		}

		function createNodes() {
			return network.SVG.selectAll(".underlyingNodes")
				.data(underlyingScimapData.nodes)
				.enter()
				.append("circle")
				.attr("class", function(d, i) {
					return "n subd_id" + d.subd_id + " disc_id" + d.disc_id;
				})
				.attr("cx", function(d, i) {
					return network.Scales.translateX(d.x);
				})
				.attr("cy", function(d, i) {
					return network.Scales.translateY(d.y);
				})
				.attr("r", 2)
				.attr("fill", function(d, i) {
					var disc = underlyingScimapData.disciplines.filter(function(d1, i1) {
						if (d.disc_id == d1.disc_id) {
							return d1;
						}
					})
					return disc[0].color;
				})
		}

		function nestData() {
			var nestedData = {
				disc: d3.nest()
					.key(function(d) {
						return parseInt(d[network.config.meta.visualization.disc]);
					})
					.rollup(function(leaves) {
						var obj = {
							children: leaves
						};
						network.GetData()[network.PrimaryDataAttr].schema.forEach(function(d) {
							if (d.type == "numeric") {
								obj[d.name] = d3.sum(leaves, function(d1) {
									return d1[d.name];
								})
							}
						})
						return obj;
					})
					.entries(useData),
				sub_disc: []
			}
			nestedData.disc.forEach(function(d, i) {
				d.values.nestedChildren = d3.nest()
					.key(function(d1) {
						return parseInt(d1[network.config.meta.visualization.sub_disc]);
					})
					.rollup(function(leaves) {
						var obj = {
							children: leaves
						};
						network.GetData()[network.PrimaryDataAttr].schema.forEach(function(d1) {
							if (d1.type == "numeric") {
								obj[d1.name] = d3.sum(leaves, function(d2) {
									return d2[d1.name];
								})
							}
						})
						return obj;
					}).entries(d.values.children);
				nestedData.sub_disc = nestedData.sub_disc.concat(d.values.nestedChildren);
			});
			return nestedData;
		}
		network.config.addclassPanel(network.SVG)
	}
	return network;
}