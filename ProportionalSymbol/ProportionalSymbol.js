visualizationFunctions.ProportionalSymbol = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.VisFunc = function() {
		var data = network.AngularArgs.data.get("records");

		var categories = ['name'];
		var categoryBank = {};

		categories.forEach(function(category) {
			categoryBank[category] = d3.nest()
				.key(function(d) {
					return d[category]; })
				.rollup(function(leaves) {
					var obj = { children: leaves };
					data.schema.forEach(function(d) {
						if (d.type == "numeric") {
							obj[d.name] = d3.mean(leaves, function(d1) {
								return d1[d.name];
							})
						} else {
							obj[d.name] = "";
							leaves.forEach(function(d1) {
								obj[d.name] += d1[d.name]
							})
						}
					})
					return obj;
				})
				.entries(data.data);
		})
		network.leaflet = network.config.easyLeafletMap(element[0], {
			worldCopyJump: true,
			minZoom: 2,
			maxZoom: 8,
			center: [39, -98],
			zoom: 3,
			closePopupOnClick: true
		}, "http://{s}.tile.openstreetmap.org")
		// .addInteractionLayer()
		.addTileLayer();
		network.leaflet.map._initPathRoot();

		network.SVG = d3.select(element[0]).select("svg");
		network.leaflet.map.on("viewreset", update);

		network.Scales.rScale = d3.scale.linear()
			.domain([0, 100])
			.range([2, 12])

		network.SVG.nodes = network.SVG.selectAll(".circle")
			.data(categoryBank[categories[0]])
			.enter()
			.append("circle")
			.attr("class", function(d, i) {
				return "id " + i
			})
			.attr("r", function(d, i) {
				return 12;
				// return network.Scales.rScale(d.values.val)
			})
		update();

		function update() {
			network.SVG.nodes
				.attr("transform", function(d, i) {
					var l1 = network.leaflet.map.latLngToLayerPoint({
						"lat": d.values.lat || 0,
						"lng": d.values.lng || 0
					});
					var x = l1.x;
					var y = l1.y;
					return "translate(" + x + "," + y + ")";
				}).on("click", function(d) {
					d.popupContent = [];
					d.popupString = "<h3 style='color:black'>" + d.key + "</h3><table>";
					Object.keys(network.config.meta.nodes.popup.content).forEach(function(d1, i1) {
						var string = "<tr>";
						string += "<td>" + network.config.meta.nodes.popup.content[d1].prettyLabel + "</td>"
						string += "<td>" + d.values[d1] + "</td></tr>"
						d.popupString += string;
					})
					d.popupString += "</table>"
					var popup = L.marker(network.leaflet.map.layerPointToLatLng(network.leaflet.map.latLngToLayerPoint({
						"lat": d.values.lat || 0,
						"lng": d.values.lng || 0
					})), {
						icon: new network.leaflet.marker({
							options: {
								autoPan: true,
								iconSize: [0, 0],
								iconAnchor: [0, 0],
								popupAnchor: [0, 0]
							}
						})
					}).addTo(network.leaflet.map).bindPopup(d.popupString);
					setTimeout(function() {
						popup.openPopup();
					}, 1);
				})
		}
	}
	return network;
}
