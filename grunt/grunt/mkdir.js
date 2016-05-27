module.exports = function(grunt) {
    return {
        workspace: {
            options: {
                create: [grunt.dirs.deploy, grunt.dirs.workspacesprojects, grunt.dirs.workspacesvisualizations]
            },
        },
        visworkspace: {
            options: {
                create: [grunt.dirs.workspacesvisualizations]
            },
        },
        projectworkspace: {
            options: {
                create: [grunt.dirs.workspacesprojects + '<%= projectName %>']
            },
        },
        projectvisualizationworkspace: {
            options: {
                create: [grunt.dirs.workspacesvisualizations + '<%= projectName %>']
            },
        },
        projectvisualization: {
            options: {
                create: [grunt.dirs.workspacesvisualizations + '<%= projectName %>' + '/' + '<%= visualizationName %>']
            }
        }
    }
}
