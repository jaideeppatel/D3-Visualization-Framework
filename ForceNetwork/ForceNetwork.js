visualizationFunctions.ForceNetwork = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();

	network.SVG = network.config.easySVG(element[0])
		.attr("background", "white")
		.attr("class", "canvas " + opts.ngIdentifier)
		.append("g")
		.attr("transform", "translate(" + (network.config.margins.left + network.config.dims.width / 2) + "," + (network.config.margins.top + network.config.dims.height / 2) + ")")
	network.meta = network.config.meta;
	network.VisFunc = function() {
		// This is to add a clickable background. The opacity MUST be greater than 0 to register a click. We don't want it overriding any background elements, so it's just baaaarely visible.
		network.SVG.background = network.SVG.append("rect")
			.attr("x", -(network.config.margins.left + network.config.dims.width / 2))
			.attr("y", -(network.config.margins.top + network.config.dims.height / 2))
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("fill", "white")
			.style("opacity", 1e-6)

		Utilities.runJSONFuncs(network.config.meta, [network.filteredData.nodes.data, network.config]);

		network.SVG.force = d3.layout.force()
			.nodes(network.filteredData.nodes.data)
			.links(network.filteredData.edges.data)
		network.SVG.force.physicsOn = true;
		network.SVG.force.physicsToggle = function() {
			if (network.SVG.force.physicsOn) {
				network.SVG.force.physicsOn = false;
				this.stop();
			} else {
				network.SVG.force.physicsOn = true;
				this.start();
			};
		};
		var drag = network.SVG.force.drag()
			.on("dragstart", function() {
				d3.event.sourceEvent.stopPropagation();
			})

		network.SVG.force.on("tick", function() {
			network.SVG.gnodes.each(function() {
				var currNode = d3.select(this);
				var nodeR = network.SVG.select(".n" + currNode.data()[0].id).attr("r");
				currNode.attr("transform", function(d) {
					x = forceBoundsCollisionCheck(d.x, network.config.dims.width, nodeR);
					y = forceBoundsCollisionCheck(d.y, network.config.dims.height, nodeR);
					return "translate(" + x + "," + y + ")"
				});
			});
			network.SVG.links.each(function() {
				d3.select(this).attr("d", function(d) {
					return Utilities.lineFunction([{
						"x": forceBoundsCollisionCheck(d.source.x, network.config.dims.width),
						"y": forceBoundsCollisionCheck(d.source.y, network.config.dims.height)
					}, {
						"x": forceBoundsCollisionCheck(d.target.x, network.config.dims.width),
						"y": forceBoundsCollisionCheck(d.target.y, network.config.dims.height)
					}])
				});
			});
		});

		var links = network.SVG.selectAll(".link")
			.data(network.filteredData.edges.data)
			.enter().append("path")
			.attr("class", function(d, i) {
				return "" + " link e s s" + d.source + " t t" + d.target;
			});
		network.SVG.links = links;
		network.SVG.gnodes = network.SVG.selectAll(".node")
			.data(network.filteredData.nodes.data)
			.enter().append("g")
			.attr("class", function(d, i) {
				return "node g g" + d[network.config.meta.nodes.identifier.attr];
			}).call(drag);
		network.SVG.nodes = network.SVG.gnodes.append("circle")
			.attr("class", function(d, i) {
				return d[network.config.meta.labels.styleEncoding.attr] + " n n" + d[network.config.meta.nodes.identifier.attr];
			})
			.attr("r", 5)

		//TODO: Fix this. Is it an issue with the canvas dimensions?
		function forceBoundsCollisionCheck(val, lim, off) {
			var offset = 0;
			if (off) {
				offset = off;
			}
			if (val <= -lim / 2 - offset) return -lim / 2 - offset;
			if (val >= lim / 2 - offset) return lim / 2 - offset;
			return val;
		};
		network.SVG.force.start();
	}
	return network;
}
