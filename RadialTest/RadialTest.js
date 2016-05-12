visualizationFunctions.RadialTest = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.VisFunc = function() {
        network.config = network.CreateBaseConfig();
        //TODO: Cut down on some of these parameters
        Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
        var useData = network.filteredData.records.data
        //TODO: Make layouts from the...layouts.
        network.SVG = network.config.easySVG(element[0], {
                "background": "white"
            })
            .attr("class", "canvas " + opts.ngIdentifier)
            .append("g")
            .attr("transform", "translate(" + (network.config.dims.width / 2) + "," + (network.config.dims.height / 2) + ")");

        network.SVG.vArc = d3.svg.arc()
            .startAngle(function(d) {
                return parseFloat(d.property("sA"));
            })
            .endAngle(function(d) {
                return parseFloat(d.property("eA"));
            })
            .innerRadius(function(d) {
                return parseFloat(d.property("iR"));
            })
            .outerRadius(function(d) {
                return parseFloat(d.property("oR"));
            });


        //TODO: Add scaletype to config
        network.Scales.outerArcScale = d3.scale.linear()
            .domain([0, 1])
            .range([0, 200])


        //Accomodating for the inner radius, plus some exterior padding
        network.SVG.t = 2;
        network.SVG.arcRadius = 1;
        if (network.config.meta.styleEncoding.arcs.overrideSize) {
            network.SVG.arcRadius = network.config.meta.styleEncoding.arcs.overrideSize;
        } else {
            network.config.meta.aggregates.forEach(function(d, i) {
                if (d.type == "single") {
                    var t1 = [];
                    useData.forEach(function(d1, i1) {
                        t1.push(d1[d.attr].length);
                    })
                    network.SVG.t += d3.max(t1);
                } else {
                    network.SVG.t += 1;
                }
            })
            network.SVG.arcRadius = d3.max([network.config.dims.width / 2, network.config.dims.height / 2]) / network.SVG.t;
        }

        network.SVG.g = network.SVG.append("g");
        network.SVG.g.selectAll(".arcGroup")
            .data(useData)
            .enter()
            .append("g")
            .attr("class", function(d, i) {
                return "arcGroup arcGroup-" + i
            })
            .each(function(d, i) {
                var currNode = d3.select(this)
                var sA = ((360 / useData.length) * i) * (Math.PI / 180);
                var eA = ((360 / useData.length) * (i + 1)) * (Math.PI / 180);
                var lastR = network.SVG.arcRadius;
                var aggG = currNode.append("g")
                    .attr("class", "agg agg-" + i)
                var n = aggG.append("path")
                    .property("sA", sA)
                    .property("eA", eA)
                    .property("iR", network.SVG.arcRadius)
                    .property("oR", network.SVG.arcRadius * 4)
                n.attr("d", network.SVG.vArc(n))
                    .attr("id", "arc" + i)
                aggG.append("text")
                    .attr("dy", 15)
                    .append("textPath")
                    .attr("xlink:href", "#arc" + i)
                    .style("text-anchor", "start")
                    .attr("startOffset", ".5%")
                    .text("agg")
                var oRs = [] 
                for (var i1 = 0; i1 < network.config.meta.aggregates.length; i1++) {
                    var currNodeArcGroup;
                    if (network.config.meta.aggregates[i1].type == "single") {
                        d[network.config.meta.aggregates[i1].attr].forEach(function(d2, i2) {
                            currNodeArcGroup = currNode.append("g")
                                .attr("class", "arc-" + i1 + "-" + i2 + " " + network.config.meta.aggregates[i1].attr);
                            var n1 = currNodeArcGroup.append("path")
                                .attr("id", "arc-" + i + "-" + i1 + "-" + i2)
                                .property("sA", sA)
                                .property("eA", eA)
                                .property("iR", lastR)
                            lastR += network.SVG.arcRadius
                            n1.property("oR", lastR)
                                .attr("d", network.SVG.vArc(n1))
                            currNodeArcGroup.append("text")
                                .attr("dy", 15)
                                .append("textPath")
                                .attr("xlink:href", "#arc-" + i + "-" + i1 + "-" + i2)
                                .style("text-anchor", "start")
                                .attr("startOffset", ".5%")
                                .text("single")
                        })
                    }
                    if (network.config.meta.aggregates[i1].type == "multi") {
                        d[network.config.meta.aggregates[i1].attr].forEach(function(d2, i2) {
                            var currNodeArcGroup = currNode.append("g")
                                .attr("class", "arc-" + i1 + "-" + i2 + " " + network.config.meta.aggregates[i1].attr);
                            var n1 = currNodeArcGroup.append("path")
                                .attr("id", "arc-" + i + "-" + i1 + "-" + i2)
                                .property("sA", sA + ((((360 / useData.length) / d[network.config.meta.aggregates[i1].attr].length) * i2) * (Math.PI / 180)))
                                .property("eA", sA + ((((360 / useData.length) / d[network.config.meta.aggregates[i1].attr].length) * (i2 + 1)) * (Math.PI / 180)))
                                .property("iR", lastR)
                                .property("oR", lastR + network.SVG.arcRadius)
                            n1.attr("d", network.SVG.vArc(n1))
                                .attr("fill", function() {
                                    return '#' + Math.floor(Math.random() * 16777215).toString(16);
                                })
                            currNodeArcGroup.append("text")
                                .attr("dy", 15)
                                .append("textPath")
                                .attr("xlink:href", "#arc-" + i + "-" + i1 + "-" + i2)
                                .style("text-anchor", "start")
                                .attr("startOffset", ".5%")
                                .text("multi")
                        })
                        lastR += network.SVG.arcRadius;
                    }
                }
            })

    }
    return network;
}






// useData.data.map(function(d, i) {
//     d.LabHourGroupStr = d.LabHourGroup.substring(d.LabHourGroup.indexOf("("))
//     d.LabHourGroup = parseInt(d.LabHourGroup);
//     // d.LabIntervalGroupStr = d.LabIntervalGroup.substring(d.LabIntervalGroup.indexOf("("))
//     // d.LabIntervalGroup = parseInt(d.LabIntervalGroup);
// })

// var nestedData = d3.nest()
//     .key(function(d) {
//         return d.LabHourGroupStr
//     })
//     .key(function(d) {
//         return d.Age
//     })
//     .key(function(d) {
//         return d.Sex
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

// var groups = [];
// var ageGroups = [];
// nestedData.forEach(function(d, i) {
//     //Makes unique time groups
//     groups.push(d.key)
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
//         //Adds unique age groups
//         if (ageGroups.indexOf(d1.key) < 0) ageGroups.push(d1.key);

//         d1.values.forEach(function(d2, i2) {
//             d2.survivalP = (d2.values.NumAlive / d2.values.NumPatients) * 100;
//             //Avoid d3
//             d2.values.children.forEach(function(d4, i4) {
//                 d[d4.LabFlag].total += d4.NumPatients
//                 d[d4.LabFlag].alive += d4.NumAlive
//             })
//         })

//     });
//     d["L"].p = Math.floor(d["L"].alive / d["L"].total * 10000) / 100 || "null"
//     d["@"].p = Math.floor(d["@"].alive / d["@"].total * 10000) / 100 || "null"
//     d["H"].p = Math.floor(d["H"].alive / d["H"].total * 10000) / 100 || "null"
//     d.p = (d["L"].alive + d["@"].alive + d["H"].alive) / (d["L"].total + d["@"].total + d["H"].total)
// })

// var data = [];
// groups.forEach(function(d, i) {
//     var age = [];
//     ageGroups.forEach(function(d1, i1) {
//         try {
//             age.push({
//                 group: d1,
//                 male: (Math.floor(nestedData[i].values[i1].values[1].survivalP * 100) / 100),
//                 female: (Math.floor(nestedData[i].values[i1].values[0].survivalP * 100) / 100)
//             })
//         } catch (except) {

//         }
//     })
//     data.push({
//         group: d,
//         lnh: [nestedData[i]["L"].p, nestedData[i]["@"].p, nestedData[i]["H"].p],
//         age: age,
//         v: Math.floor(nestedData[i].p * 10000) / 100
//     })
// })

// var vScale = d3.scale.linear()
//     .domain([0, 100]).range([network.config.dims.width * .35, network.config.dims.width * .45])
// var childOneROff = network.config.dims.width * .05;
// var childTwoROff = childOneROff * 3;
// var childTwoRH = childOneROff * 3;
// var innerROff = network.config.dims.width * .0625;

// data.map(function(d, i) {
//     d.i = i;
//     d.sA = ((360 / data.length) * i) * (Math.PI / 180);
//     d.eA = (360 / data.length) * (i + 1) * (Math.PI / 180);
//     d.iR = innerROff;
//     d.oR = vScale(d.v);
//     d.childOne = [];
//     d.childTwo = [];
//     d.lnh.forEach(function(d1, i1) {
//         d.childOne.push({
//             lnh: d1,
//             sA: d.sA,
//             eA: d.eA,
//             iR: d.iR + (childOneROff * i1),
//             oR: d.iR + (childOneROff * (i1 + 1))
//         })
//     })
//     d.age.forEach(function(d1, i1) {
//         var scale = d3.scale.linear().domain([0, d1.male + d1.female]).range([12, childTwoRH])
//         var iR = d.iR + childTwoROff;
//         var oR = iR + scale(d1.male);
//         var sA = ((d.eA - d.sA) / d.age.length) * i1 + d.sA;
//         var eA = ((d.eA - d.sA) / d.age.length) * (i1 + 1) + d.sA
//         d.childTwo.push({
//             male: {
//                 age: d1,
//                 sA: sA,
//                 eA: eA,
//                 iR: iR,
//                 oR: oR
//             },
//             female: {
//                 age: d1,
//                 sA: sA,
//                 eA: eA,
//                 iR: oR,
//                 oR: oR + scale(d1.female)
//             }
//         })
//     })

// });
// //TODO: Color scale and labels

// var pRange = []
// nestedData.forEach(function(d, i) {
//     pRange.push(d.p * 100)
// })
// var cScale = d3.scale.linear().domain([61.07, 78.01, 94.92]).range(["#DD746F", "#F5ED8A", "#93C180"])
// network.SVG.group = network.SVG.selectAll("group")
//     .data(data)
//     .enter()
//     .append("g")
//     .attr("transform", "rotate(-60 0 0)")
//     .each(function(d, i) {
//         var elem = d3.select(this);
//         elem.append("path")
//             .attr("id", "outer" + i)
//             .attr("d", vArc)
//             .style("stroke", "#D3D3D3")
//             .style("fill", "#E8E8E8")
//         elem.append("text")
//             .attr("dy", 15)
//             .append("textPath")
//             .attr("xlink:href", "#outer" + i)
//             .style("text-anchor", "start")
//             .attr("startOffset", ".5%")
//             .text("3 Year Survival Percentile: " + d.v + "%");


//         d.childOne.forEach(function(d1, i1) {
//             elem.append("path")
//                 .attr("d", function() {
//                     return vArc(d1)
//                 })
//                 .attr("id", "low" + i + i1)
//                 .style("stroke", "#222")
//                 .style("stroke-width", .75)
//                 .style("fill", cScale(d1.lnh))
//             elem.append("text")
//                 .attr("dy", 15)
//                 .append("textPath")
//                 .attr("xlink:href", "#low" + i + i1)
//                 .style("text-anchor", "middle")
//                 .attr("startOffset", "25%")
//                 .text(function() {
//                     return "WBC Val - " + ["Low", "Normal", "High"][i1] + ": " + d1.lnh + "%"
//                 });
//         })
//         elem.append("text")
//             .attr("dx", 0)
//             .attr("dy", 0)
//             .append("textPath")
//             .attr("xlink:href", "#outer" + i)
//             .style("text-anchor", "middle")
//             .attr("startOffset", "25%")
//             .text("Time of WBC: " + d.group);
//         d.childTwo.forEach(function(d1, i1) {
//             var childTwoGroup = elem.append("g")
//                 .attr("class", "sex")
//             childTwoGroup.append("path")
//                 .attr("class", "male")
//                 .attr("id", "male" + i + i1)
//                 .attr("d", function() {
//                     return vArc(d1.male)
//                 })
//                 .style("fill", "#26A9E1")
//             elem.append("text")
//                 .attr("dx", 5)
//                 .attr("dy", 10)
//                 .append("textPath")
//                 .attr("xlink:href", "#male" + i + i1)
//                 .style("text-anchor", "start")
//                 .attr("startOffset", "0%")
//                 .text(function() {
//                     return "Male|" + ageGroups[i1] + "-" + (parseInt(ageGroups[i1]) + 10)
//                 })
//                 .style("font-size", "9")

//             elem.append("text")
//                 .attr("dx", 5)
//                 .attr("dy", 25)
//                 .append("textPath")
//                 .attr("xlink:href", "#male" + i + i1)
//                 .style("text-anchor", "start")
//                 .attr("startOffset", "0%")
//                 .text(function() {
//                     return d1.male.age.male + "%"
//                 })
//                 .style("font-size", "11")
//             childTwoGroup.append("path")
//                 .attr("class", "female")
//                 .attr("id", "female" + i + i1)
//                 .attr("d", function() {
//                     return vArc(d1.female)
//                 })
//                 .style("fill", "#C369C9")
//             childTwoGroup
//                 .style("stroke", "#222")
//                 .style("stroke-width", .75)
//             elem.append("text")
//                 .attr("dx", 5)
//                 .attr("dy", 10)
//                 .append("textPath")
//                 .attr("xlink:href", "#female" + i + i1)
//                 .style("text-anchor", "start")
//                 .attr("startOffset", "0%")
//                 .text(function() {
//                     return "Female|" + ageGroups[i1] + "-" + (parseInt(ageGroups[i1]) + 10)
//                 })
//                 .style("font-size", "9")
//             elem.append("text")
//                 .attr("dx", 5)
//                 .attr("dy", 25)
//                 .append("textPath")
//                 .attr("xlink:href", "#female" + i + i1)
//                 .style("text-anchor", "start")
//                 .attr("startOffset", "0%")
//                 .text(function() {
//                     return d1.female.age.female + "%"
//                 })
//                 .style("font-size", "11")

//         })
//     })

// d3.selectAll("text").moveToFront();





//Data is only scopes to time group
//Ages are percentages of the age group
// groupby lab hour group
// group by age/sex
// sum of num patients alive/num patients
// ignore labinterval for now
