var VisualizationClass = function() {
	this.config = null,
		this.VisFunc = null,
		this.Vis = null,
		this.SVG = null,
		this.Scales = {},
		this.Children = [],
		this.events = null,
		this.isFirstRun = true,
		this.PrimaryDataAttr = "",
		this.filteredData = {nodes:{data:{}},edges:{data:{}},records:{data:{}}},
		this.AngularArgs = {
			element: "",
			data: {nodes:{data:{}},edges:{data:{}},records:{data:{}}},
			opts: ""
		},
		this.Verbose = verbose || false,		
		this.CreateBaseConfig = function() {
			var out = {};
			out.margins = {};
			out.dims = {};
			out.meta = configs[this.AngularArgs.opts.ngIdentifier];
			out.margins.top = parseInt(this.AngularArgs.opts.ngMarginTop) || 0;
			out.margins.right = parseInt(this.AngularArgs.opts.ngMarginRight) || 0;
			out.margins.bottom = parseInt(this.AngularArgs.opts.ngMarginBottom) || 0;
			out.margins.left = parseInt(this.AngularArgs.opts.ngMarginLeft) || 0;
			out.dateFormat = this.AngularArgs.opts.ngDateFormat || "%d-%b-%y";
			out.dims.width = (this.AngularArgs.opts.ngWidth || $(this.AngularArgs.element[0]).width());
			out.dims.height = (this.AngularArgs.opts.ngHeight || $(this.AngularArgs.element[0]).height());
			out.dims.fixedWidth = out.dims.width - out.margins.left - out.margins.right;
			out.dims.fixedHeight = out.dims.height - out.margins.top - out.margins.bottom;
			out.colors = this.AngularArgs.opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362",
				"#FFD24F", "#FF661C", "#DB4022", "#FF5373",
				"#EE81A8", "#EE43A9", "#B42672", "#91388C",
				"#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5",
				"#0067C9", "#008FDE", "#009ADC", "#007297",
				"#12978B", "#00BBB5", "#009778", "#75A33D",
				"#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"
			];
			out.easySVG = function(selector) {
				return d3.select(selector)
					.append("svg")
					.attr("transform", "translate(" + out.margins.left + "," + out.margins.top + ")")
					.attr("width", out.dims.width)
					.attr("height", out.dims.height);
			}
			out.easyGraphLayout = function(network) {
				network.SVG.graphOpts = {};
				network.SVG.graphOpts.margins = {
					top: 	network.config.margins.top 		|| 10,
					left: 	network.config.margins.left 	|| 10,
					right: 	network.config.margins.right 	|| 10,
					bottom: network.config.margins.bottom 	|| 10
				}
				network.SVG.graphOpts.wOffset = network.SVG.graphOpts.margins.left;
				network.SVG.graphOpts.hOffset = network.SVG.graphOpts.margins.top;
				network.SVG.graphOpts.width   =	network.config.dims.fixedWidth - network.SVG.graphOpts.margins.left - network.SVG.graphOpts.margins.right;
				network.SVG.graphOpts.height  =	network.config.dims.fixedHeight - network.SVG.graphOpts.margins.top - network.SVG.graphOpts.margins.bottom;				
			}
			out.easyGraph = function(network, opts) {
				network.Scales.x.range([0, network.SVG.graphOpts.width]);
				network.Scales.y.range([network.SVG.graphOpts.height, 0]);
				network.Scales.x1.range([network.SVG.graphOpts.wOffset, network.SVG.graphOpts.width + network.SVG.graphOpts.wOffset])
				network.Scales.y1.range([network.SVG.graphOpts.height + network.SVG.graphOpts.hOffset, network.SVG.graphOpts.hOffset])


				network.Scales.xAxis = d3.svg.axis()
					.scale(opts.x.scale1)
					.orient(opts.x.orient || "bottom")
					.tickSize(5);
				network.Scales.yAxis = d3.svg.axis()
					.scale(opts.y.scale1)
					.tickSize(network.SVG.graphOpts.width)
					.orient(opts.y.orient || "left");
				network.SVG.graphG = network.SVG.append("g")
					.attr("transform", function(d, i) {
						return "translate(" + network.SVG.graphOpts.wOffset + "," + network.SVG.graphOpts.hOffset + ")"
					});
				var xAxisTranslate = network.SVG.graphOpts.height;
				if (opts.x.orient == "top") {
					xAxisTranslate = 0;
				}
				network.SVG.xAxisG = network.SVG.graphG.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + xAxisTranslate + ")")
					.call(network.Scales.xAxis);
				var yAxisTranslate = network.SVG.graphOpts.width;
				if (opts.y.orient == "right") {
					yAxisTranslate = 0;
				}
				network.SVG.yAxisG = network.SVG.graphG.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + yAxisTranslate + ",0)")
					.call(network.Scales.yAxis);
				var xLabelTranslate = network.SVG.graphOpts.height + network.SVG.graphOpts.hOffset;
				if (opts.x.orient == "top") {
					xLabelTranslate = -20;
				}		
				network.SVG.graphG.xAxisLabel = network.SVG.graphG
					.append("text")
					.attr("class", "l2")
					.attr("transform", "translate(" + (network.SVG.graphOpts.width / 2) + "," + xLabelTranslate + ")")
					.attr("text-anchor", "middle")
					.text(opts.x.label)
				var yLabelTranslate = -20;
				if (opts.y.orient == "right") {
					yLabelTranslate = network.SVG.graphOpts.width + network.SVG.graphOpts.wOffset;
				}			
				network.SVG.graphG.yAxisLabel = network.SVG.graphG
					.append("text")
					.attr("class", "l2")
					.attr("transform", "translate(" + yLabelTranslate + "," + (network.SVG.graphOpts.height / 2) + ")rotate(270)")
					.attr("text-anchor", "middle")
					.text(opts.y.label)

				var tLabelTranslate = -40;
				if (opts.t.orient == "bottom") {
					tLabelTranslate = network.SVG.graphOpts.height + 40;
				}		
				network.SVG.graphG.title = network.SVG.graphG
					.append("text")
					.attr("class", "l")
					.attr("transform", "translate(" + (network.SVG.graphOpts.width / 2) + "," + tLabelTranslate + ")")
					.attr("text-anchor", "middle")
					.text(opts.t.label)
			}
			out.easyLeafletMap = function(container, options, tileURL) {
				var obj = new Object();
				obj.map = L.map(container, options);
				var map = obj.map;
				// map._initPathRoot();
				var leaflet = obj;
				obj.TILE_URL = tileURL + "/{z}/{x}/{y}.png";
				obj.addTileLayer = function() {
					L.tileLayer(obj.TILE_URL, {
						tms: false
					}).addTo(map);
					return obj;
				};
				obj.addInteractionLayer = function() {
					geojson = L.geoJson(statesData, {
						onEachFeature: onEachFeature,
						style: {
							weight: 0,
							opacity: 0,
							fillOpacity: 0
						}
					}).addTo(map);

					function zoomToFeature(e) {
						var mapZoom = map.getZoom();
						if (mapZoom <= 8 && mapZoom >= 5) {
							map.fitBounds(e.target.getBounds());
						} else {
							map.zoomIn();
						}
					}

					function onEachFeature(feature, layer) {
						layer.on({
							dblclick: zoomToFeature
						});
					}
					return obj;
				};
				obj.disableInteractions = function() {
					map.dragging.disable();
					map.keyboard.disable();
					obj.disableZoom();
					return obj;
				};
				obj.disableZoom = function() {
					map.touchZoom.disable();
					map.doubleClickZoom.disable();
					map.scrollWheelZoom.disable();
					map.boxZoom.disable();
					return obj;
				};
				obj.enableInteractions = function() {
					map.dragging.enable();
					map.keyboard.enable();
					obj.enableZoom();
					return obj;
				};
				obj.enableZoom = function() {
					map.touchZoom.enable();
					map.doubleClickZoom.enable();
					map.scrollWheelZoom.enable();
					map.boxZoom.enable();
					return obj;
				};
				obj.initPopup = function() {
					//TODO: Implement obj
				};
				obj.removePopup = function() {
					map.closePopup();
				}
				obj.latLngDebug = function() {
					map.on('click', function(e) {
						locationClicked = [e.latlng.lat, e.latlng.lng];
						console.log(locationClicked);
					});
					return obj;
				};
				obj.marker = L.Icon.extend({
					options: {
						iconUrl: 'images/up_arrow.svg',
						iconSize: [0, 0],
						shadowSize: [0, 0],
						iconAnchor: [0, 0],
						shadowAnchor: [0, 0],
						popupAnchor: [0, 0]
					}
				});
				return obj;
			}			
			return out;
		},
		this.ClearVis = function() {
			try {
				this.SVG.selectAll("*").remove();
			} catch (exception) {}
			return this;
		},
		this.ResetVis = function() {
			this.ClearVis();
			this.RunVis();
			return this;
		},
		this.RunEvents = function() {
			if (events[this.AngularArgs.opts.ngIdentifier])
				events[this.AngularArgs.opts.ngIdentifier](visualizations[this.AngularArgs.opts.ngIdentifier]);
			var indent = "     ";
			if (this.AngularArgs.opts.ngComponentFor != null) indent += indent;
			if (this.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Events bound: " + this.AngularArgs.opts.ngIdentifier);
			return this;
		},
		this.RunChildVisualizations = function() {
			var that = this;
			this.Children.forEach(function(v) {
				visualizations[v].Update();
				visualizations[v].PrimaryDataAttr = that.PrimaryDataAttr;
			})
		},
		//Simple duplicate request removal. Kills the timeout and reruns it within 10ms. Will this work with huge datasets?
		this.RunVisQueue;
		this.DataRange = [];
		this.prepareData = function() {
			if (dataprep[this.AngularArgs.opts.ngIdentifier]) {
				dataprep[this.AngularArgs.opts.ngIdentifier](visualizations[this.AngularArgs.opts.ngIdentifier]);
			} else {
				this.filteredData = this.AngularArgs.data;
			}
		}
		this.RunVis = function(args) {
			var args = args || {};
			clearTimeout(this.RunVisQueue);
			var that = this;
			this.RunVisQueue = setTimeout(function() {
				that.prepareData();
				that.ClearVis();
				if (that.isFirstRun) {
					that.Vis(that.AngularArgs.element, that.AngularArgs.data, that.AngularArgs.opts);
				}
				try {
					if (!that.AngularArgs.opts.ngLazy || args.lazyRun) that.VisFunc();
				} catch (exception) {
					if (that.Verbose) console.log("Visualization failed: " + that.AngularArgs.opts.ngIdentifier);
					throw exception;
				}
				var indent = " ";
				if (that.AngularArgs.opts.ngComponentFor != null) indent += "     ";
				if (that.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Created visualization: " + that.AngularArgs.opts.ngIdentifier);
				angular.element(document).ready(function() {
					//TODO: For demo purposes. Pops in the customization.
					if (!args.skipEvents) setTimeout(function() {
						that.RunChildVisualizations();
						that.RunEvents();
					}, 150);
				});
				that.isFirstRun = false;
			}, 10);
			return that;
		},

		this.SetAngularArgs = function(element, data, opts) {
			this.SetAngularElement(element);
			this.SetAngularData(data);
			this.SetAngularOpts(opts);
		},
		this.SetAngularElement = function(element) {
			this.AngularArgs.element = element;
		},
		this.SetAngularData = function(data) {
			this.AngularArgs.data = Immutable.Map(data) || Immutable.Map({nodes:{data:{}},edges:{data:{}},records:{data:{}}});
			// this.filteredData = data;
			if (data.topology == "graph") this.PrimaryDataAttr = "nodes";
			if (data.topology == "table") this.PrimaryDataAttr = "records";
		},
		this.SetAngularOpts = function(opts) {
			this.AngularArgs.opts = opts;
		},
		this.Update = function() {
			this.RunVis();
		}
};
