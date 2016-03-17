// Deletes specified folders.
exports.init = function(grunt) {
    console.log(grunt);
    return {
        clean: {
            deploys: ['deploy/'],
            deploy: ['deploy/' + grunt.option('project')],
            projects: ['workspaces/projects'],
            project: ['workspaces/projects/' + grunt.option('project')],
            visualizations: ['workspaces/visualizations/'],
            visualization: ['workspaces/visualizations/' + grunt.option('vis')]
        }
    }
}
