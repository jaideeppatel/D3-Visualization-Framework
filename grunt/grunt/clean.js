/**
 * @memberOf gruntconfig
 * @type {Object}
 * @property {Array} deploys Cleans the entire deployment directory.
 * @property {Array} deploy Cleans the deploy/{@link grunt.config.data.projectName} directory.
 * @property {Array} projects Cleans the entire ../workspaces/projects directory.
 * @property {Array} project Cleans the ../workspaces/projects/{@link grunt.config.data.projectName} directory.
 * @property {Array} visualizations Cleans the entire ../workspaces/visualizations directory.
 * @property {Array} visualization Cleans the ../workspaces/visualizations/{@link grunt.config.data.projectName} directory.
 * @description {@link https://www.npmjs.com/package/clean NPM Documentation}.  If the {@link web_server} task is running or if the files are in use, this task will fail.
 */
module.exports = function(grunt) {
    return {
        deploys: [grunt.dirs.deploy],
        deploy: [(grunt.dirs.deploy + '<%= projectName %>')],
        projects: [grunt.dirs.workspacesprojects],
        project: [(grunt.dirs.workspacesprojects + '<%= projectName %>')],
        visualizations: [grunt.dirs.workspacesvisualizations],
        visualization: [grunt.dirs.workspacesvisualizations + '<%= projectName %>'],
        options: {
            force: true
        }
    }
}
