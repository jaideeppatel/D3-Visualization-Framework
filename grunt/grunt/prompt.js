module.exports = function (grunt) {
    var prompts = {
        input: [{
            name: "configdir",
            config: "configdir",
            message: "Please enter the config file location:"

        }, {
            name: "visualizationname",
            config: "visualizationName",
            message: "Please enter the visualization name (Same as top level folder in repository):"

        }, {
            name: "commitid",
            config: "commitID",
            message: "Please enter the commit id:"

        }, {
            name: "visualizationalias",
            config: "visualizationAlias",
            message: "Please enter the visualization alias (Should be unique to prevent issues):"

        }, {
            name: "projectname",
            config: "projectName",
            message: "Please enter the project name (alias):"

        }, {
            name: "baseurl",
            config: "baseURL",
            message: "Please enter the framework base repo URL:"

        }, {
            name: "pluginsurl",
            config: "pluginsURL",
            message: "Please enter the plugins repo URL:"

        }, {
            name: "projecturl",
            config: "projectURL",
            message: "Please enter the project repo URL:"

        }]
    }
    var obj = {

    }
    Object.keys(prompts).forEach(function(d, i) {
        prompts[d].forEach(function(d1, i1) {
            obj[d1.name] = {
                options: {
                    questions: [{
                        config: d1.config,
                        type: d,
                        message: d1.message,
                        when: function(answers) {
                            if (grunt.config.data[d1.config]) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            }
        })
    })    
    return obj
};