visualizationFunctions.RadialTest = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];
    network.config = network.CreateBaseConfig();
    network.meta = network.config.meta;
    network.VisFunc = function() {
        // var data = network.AngularArgs.data.get("").data;
        Utilities.runJSONFuncs(network.config.meta, [data, network.config]);
        network.config = network.CreateBaseConfig();
        var useData = network.AngularArgs.data.get("records");
        network.SVG = network.config.easySVG(element[0], {
                // "height": useData.length * 3,
                "background": "white"
            })
            .attr("class", "canvas " + opts.ngIdentifier)
            .append("g")
            .attr("transform", "translate(" + (network.config.dims.width / 2) + "," + (network.config.dims.height / 2) + ")");


        var vArc = d3.svg.arc()
            .startAngle(function(d) {
                return d.sA;
            })
            .endAngle(function(d) {
                return d.eA;
            })
            .innerRadius(function(d) {
                return d.iR;
            })
            .outerRadius(function(d) {
                return d.oR;
            });

        useData.data.map(function(d, i) {
            d.LabHourGroupStr = d.LabHourGroup.substring(d.LabHourGroup.indexOf("("))
            d.LabHourGroup = parseInt(d.LabHourGroup);
            // d.LabIntervalGroupStr = d.LabIntervalGroup.substring(d.LabIntervalGroup.indexOf("("))
            // d.LabIntervalGroup = parseInt(d.LabIntervalGroup);
        })

        var nestedData = d3.nest()
            .key(function(d) {
                return d.LabHourGroupStr
            })
            .key(function(d) {
                return d.Age
            })
            .key(function(d) {
                return d.Sex
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

                return obj;
            })
            .entries(useData.data);

        var groups = [];
        var ageGroups = [];
        nestedData.forEach(function(d, i) {
            //Makes unique time groups
            groups.push(d.key)
            d["L"] = {
                total: 0,
                alive: 0
            };
            d["@"] = {
                total: 0,
                alive: 0
            };
            d["H"] = {
                total: 0,
                alive: 0
            };
            d.values.forEach(function(d1, i1) {
                //Adds unique age groups
                if (ageGroups.indexOf(d1.key) < 0) ageGroups.push(d1.key);

                d1.values.forEach(function(d2, i2) {
                    d2.survivalP = (d2.values.NumAlive / d2.values.NumPatients) * 100;
                    //Avoid d3
                    d2.values.children.forEach(function(d4, i4) {
                        d[d4.LabFlag].total += d4.NumPatients
                        d[d4.LabFlag].alive += d4.NumAlive
                    })
                })

            });
            d["L"].p = Math.floor(d["L"].alive / d["L"].total * 10000) / 100 || "null"
            d["@"].p = Math.floor(d["@"].alive / d["@"].total * 10000) / 100 || "null"
            d["H"].p = Math.floor(d["H"].alive / d["H"].total * 10000) / 100 || "null"
            d.p = (d["L"].alive + d["@"].alive + d["H"].alive) / (d["L"].total + d["@"].total + d["H"].total)
        })

        var data = [];
        groups.forEach(function(d, i) {
            var age = [];
            ageGroups.forEach(function(d1, i1) {
                try {
                    age.push({
                        group: d1,
                        male: (Math.floor(nestedData[i].values[i1].values[1].survivalP * 100) / 100),
                        female: (Math.floor(nestedData[i].values[i1].values[0].survivalP * 100) / 100)
                    })
                } catch (except) {

                }
            })
            data.push({
                group: d,
                lnh: [nestedData[i]["L"].p, nestedData[i]["@"].p, nestedData[i]["H"].p],
                age: age,
                v: Math.floor(nestedData[i].p * 10000) / 100
            })
        })

        var vScale = d3.scale.linear()
            .domain([0, 100]).range([network.config.dims.width * .35, network.config.dims.width * .45])
        var childOneROff = network.config.dims.width * .05;
        var childTwoROff = childOneROff * 3;
        var childTwoRH = childOneROff * 3;
        var innerROff = network.config.dims.width * .0625;

        data.map(function(d, i) {
            d.i = i;
            d.sA = ((360 / data.length) * i) * (Math.PI / 180);
            d.eA = (360 / data.length) * (i + 1) * (Math.PI / 180);
            d.iR = innerROff;
            d.oR = vScale(d.v);
            d.childOne = [];
            d.childTwo = [];
            d.lnh.forEach(function(d1, i1) {
                d.childOne.push({
                    lnh: d1,
                    sA: d.sA,
                    eA: d.eA,
                    iR: d.iR + (childOneROff * i1),
                    oR: d.iR + (childOneROff * (i1 + 1))
                })
            })
            d.age.forEach(function(d1, i1) {
                var scale = d3.scale.linear().domain([0, d1.male + d1.female]).range([12, childTwoRH])
                var iR = d.iR + childTwoROff;
                var oR = iR + scale(d1.male);
                var sA = ((d.eA - d.sA) / d.age.length) * i1 + d.sA;
                var eA = ((d.eA - d.sA) / d.age.length) * (i1 + 1) + d.sA
                d.childTwo.push({
                    male: {
                        age: d1,
                        sA: sA,
                        eA: eA,
                        iR: iR,
                        oR: oR
                    },
                    female: {
                        age: d1,
                        sA: sA,
                        eA: eA,
                        iR: oR,
                        oR: oR + scale(d1.female)
                    }
                })
            })

        });
        //TODO: Color scale and labels

        var pRange = []
        nestedData.forEach(function(d, i) {
            pRange.push(d.p * 100)
        })
        var cScale = d3.scale.linear().domain([61.07, 78.01, 94.92]).range(["#DD746F", "#F5ED8A", "#93C180"])
        network.SVG.group = network.SVG.selectAll("group")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", "rotate(-60 0 0)")
            .each(function(d, i) {
                var elem = d3.select(this);
                elem.append("path")
                    .attr("id", "outer" + i)
                    .attr("d", vArc)
                    .style("stroke", "#D3D3D3")
                    .style("fill", "#E8E8E8")
                    // .on("click", function(d, i) {
                    //     network.SVG.group.attr("transform", "rotate (" + (-60 + (d.i * -120)) + " 0 0)")
                    // })
                elem.append("text")
                    .attr("dy", 15)
                    .append("textPath")
                    .attr("xlink:href", "#outer" + i)
                    .style("text-anchor", "start")
                    .attr("startOffset", ".5%")
                    .text("3 Year Survival Percentile: " + d.v + "%");


                d.childOne.forEach(function(d1, i1) {
                    elem.append("path")
                        .attr("d", function() {
                            return vArc(d1)
                        })
                        .attr("id", "low" + i + i1)
                        .style("stroke", "#222")
                        .style("stroke-width", .75)
                        .style("fill", cScale(d1.lnh))
                    elem.append("text")
                        .attr("dy", 15)
                        .append("textPath")
                        .attr("xlink:href", "#low" + i + i1)
                        .style("text-anchor", "middle")
                        .attr("startOffset", "25%")
                        .text(function() {
                            return "WBC Val - " + ["Low", "Normal", "High"][i1] + ": " + d1.lnh + "%"
                        });
                })
                elem.append("text")
                    .attr("dx", 0)
                    .attr("dy", 0)
                    .append("textPath")
                    .attr("xlink:href", "#outer" + i)
                    .style("text-anchor", "middle")
                    .attr("startOffset", "25%")
                    .text("Time of WBC: " + d.group);
                d.childTwo.forEach(function(d1, i1) {
                    var childTwoGroup = elem.append("g")
                        .attr("class", "sex")
                    childTwoGroup.append("path")
                        .attr("class", "male")
                        .attr("id", "male" + i + i1)
                        .attr("d", function() {
                            return vArc(d1.male)
                        })
                        .style("fill", "#26A9E1")
                    elem.append("text")
                        .attr("dx", 5)
                        .attr("dy", 10)
                        .append("textPath")
                        .attr("xlink:href", "#male" + i + i1)
                        .style("text-anchor", "start")
                        .attr("startOffset", "0%")
                        .text(function() {
                            return "Male|" + ageGroups[i1] + "-" + (parseInt(ageGroups[i1]) + 10)
                        })
                        .style("font-size", "9")

                    elem.append("text")
                        .attr("dx", 5)
                        .attr("dy", 25)
                        .append("textPath")
                        .attr("xlink:href", "#male" + i + i1)
                        .style("text-anchor", "start")
                        .attr("startOffset", "0%")
                        .text(function() {
                            return d1.male.age.male + "%"
                        })
                        .style("font-size", "11")
                    childTwoGroup.append("path")
                        .attr("class", "female")
                        .attr("id", "female" + i + i1)
                        .attr("d", function() {
                            return vArc(d1.female)
                        })
                        .style("fill", "#C369C9")
                    childTwoGroup
                        .style("stroke", "#222")
                        .style("stroke-width", .75)
                    elem.append("text")
                        .attr("dx", 5)
                        .attr("dy", 10)
                        .append("textPath")
                        .attr("xlink:href", "#female" + i + i1)
                        .style("text-anchor", "start")
                        .attr("startOffset", "0%")
                        .text(function() {
                            return "Female|" + ageGroups[i1] + "-" + (parseInt(ageGroups[i1]) + 10)
                        })
                        .style("font-size", "9")
                    elem.append("text")
                        .attr("dx", 5)
                        .attr("dy", 25)
                        .append("textPath")
                        .attr("xlink:href", "#female" + i + i1)
                        .style("text-anchor", "start")
                        .attr("startOffset", "0%")
                        .text(function() {
                            return d1.female.age.female + "%"
                        })
                        .style("font-size", "11")

                })
            })

        d3.selectAll("text").moveToFront();
    }
    return network;
}


//Data is only scopes to time group
//Ages are percentages of the age group
// groupby lab hour group
// group by age/sex
// sum of num patients alive/num patients
// ignore labinterval for now
