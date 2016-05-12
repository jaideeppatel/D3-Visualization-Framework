Array.prototype.getUnique = function() {
    var u = {},
        a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

visualizationFunctions.Sankey = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.SVGBase = network.config.easySVG(element[0])
        .attr('background', 'white')
        .attr('class', 'canvas ' + opts.ngIdentifier)
        .style("overflow", "scroll")
    network.SVG = network.SVGBase.append("g")
        .attr('transform', 'translate(' + (network.config.margins.left) + ',' + (network.config.margins.top) + ')')
    network.VisFunc = function() {
        var useData = network.filteredData[network.PrimaryDataAttr].data;
        var offsetW = 4;
        var offsetH = 200;
        var sankey = d3.sankey()
            .nodeWidth(network.config.meta.nodes.styleEncoding.size.value)
            .nodePadding(4)
            .size([network.config.dims.fixedWidth - offsetW, network.config.dims.fixedHeight - offsetH]);
        var path = sankey.link();
        graph = {
            "nodes": [],
            "links": []
        };

        function has(object, key) {
            return object ? hasOwnProperty.call(object, key) : false;
        }

        network.filteredData.records.data.map(function(d, i) {
            var pre = "";
            network.config.meta.other.categories.forEach(function(d1, i1) {
                d[d1] = pre + d[d1].replaceAll(" ", "").replaceAll(/\//g, "").replaceAll(/\./g,"dotdot")
                pre += "_"
            })
        })


        var stepOne = {};
        network.filteredData.records.data.forEach(function(d, i) {
            var str = ""
            network.config.meta.other.categories.forEach(function(d1, i1) {
                str += d[d1] + "-"
            })
            if (has(stepOne, str)) {
                stepOne[str].children.push(d)
            } else {
                stepOne[str] = { children: [d], uid: str }
            }
        })

        var stepTwo = [];
        network.noderef = {}
        var refi = 0;
        Object.keys(stepOne).forEach(function(d, i) {
            var outObj = new Object();
            network.config.meta.other.categories.forEach(function(d1, i1) {
                if (stepOne[d].children.length > 0) {
                    outObj[d1] = stepOne[d].children[0][d1]
                    if (!has(network.noderef, outObj[d1])) {
                        network.noderef[outObj[d1]] = refi.toString();
                        refi++;
                    }
                }
            })
            outObj.count = stepOne[d].children.length
            outObj.uid = stepOne[d].uid
            stepTwo.push(outObj)
        });
        stepTwo.forEach(function(d, i) {
            network.config.meta.other.categories.forEach(function(d1, i1) {
                d[d1 + "s"] = network.noderef[d[d1]]
            });
        })


        var stepThree = [];
        stepTwo.forEach(function(d, i) {
            network.config.meta.other.categories.forEach(function(d1, i1) {
                if (i1 < network.config.meta.other.categories.length - 1) {

                    stepThree.push({
                        source: d[network.config.meta.other.categories[i1]],
                        target: d[network.config.meta.other.categories[i1 + 1]],
                        value: d.count,
                        uid: d.uid
                    })
                }
            })
        })


        stepThree.forEach(function(d) {
            if (d.source != null && d.target != null) {                
                graph.nodes.push({ "name": d.source, "uid": d.uid });
                graph.nodes.push({ "name": d.target, "uid": d.uid });
                graph.links.push({
                    "source": d.source,
                    "target": d.target,
                    "value": +d.value,
                    "uid": d.uid
                });

            }
        });


        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
            .key(function(d) {
                return d.name;
            })
            .map(graph.nodes));
        // loop through each link replacing the text with its index from node
        graph.links.forEach(function(d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        //now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function(d, i) {
            graph.nodes[i] = { "name": d};
        });

        graph.links.sort(function(a, b) {
            return a.value - b.value;
        });
        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(0);

        network.SVG.group = network.SVG.append("g")
            .attr("transform", "translate(" + (offsetW / 2) + "," + (offsetH / 2) + ")")

        network.SVG.edges = network.SVG.group.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", function(d, i) {
                return "e" + " " + d.uid;
            })
            .property("uid", function(d, i) {
                return d.uid;
            })
            .each(function(){})
            .attr("id", function(d, i) {
                d.id = i;
                return "link-" + i;
            })
            .attr("d", path)
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy);
            })
            // .style("opacity", function(d, i) {
            //     return i / graph.links.length
            // })
            .on("mouseover", function(d, i) {
                network.SVG.edges.classed("selected", false)
                network.SVG.edges.filter("." + d3.select(this).property("uid")).classed("selected", true).moveToFront();
            })
            .on("mouseout", function(d, i) {
                network.SVG.edges.classed("selected", false)
            })  
        network.SVG.edges.append("title")
            .text(function(d) {
                return d.source.name + " → " +
                    d.target.name + "\n" + Utilities.formatValue["number"](d.value);
            });
        network.SVG.nodes = network.SVG.group.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", function(d, i) {
                return "node " + d.name.replaceAll("_", "")
            })
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on("mouseover", function(d) {
                network.SVG.selectAll("path").classed("selected", false)
                d.sourceLinks.forEach(function(d1, i1) {
                    network.SVG.selectAll("path").filter("." + d1.uid).classed("selected", true).moveToFront();
                })
                d.targetLinks.forEach(function(d1, i1) {
                    network.SVG.selectAll("path").filter("." + d1.uid).classed("selected", true).moveToFront();
                })                
            })
            .on("mouseout", function(d, i) {
                network.SVG.edges.classed("selected", false)
            })                        
            // .on("click", highlight_node_links)

        .call(d3.behavior.drag()
            .origin(function(d) {
                return d;
            })
            .on("dragstart", function() { this.parentNode.appendChild(this); })
            .on("dragend", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

        network.SVG.nodes.append("rect")
            .attr("height", function(d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) {
                return '#' + Math.floor(Math.random() * 16777215).toString(16);
            })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title")
            .text(function(d) {
                return d.name + "\n" + Utilities.formatValue[""](d.value);
            });

        network.SVG.nodes.append("text")
            .attr("x", -6)
            .attr("y", function(d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) {
                return d.name.replaceAll("_", " ").replaceAll("dotdot", ".");
            })
            .filter(function(d) {
                return d.x < network.config.dims.fixedWidth / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        function dragmove(d) {
            d3.select(this).attr("transform",
                "translate(" + d.x + "," + (
                    d.y = Math.max(0, Math.min(network.config.dims.fixedHeight - d.dy, d3.event.y))
                ) + ")");
            // sankey.relayout();
            network.SVG.edges.attr("d", path);
        }

        //http://bl.ocks.org/git-ashish/8959771
    }
    return network;
}
