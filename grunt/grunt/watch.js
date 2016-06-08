/**
 * @memberOf gruntconfig
 * @type {Object}
 * @description {@link https://github.com/gruntjs/grunt-contrib-watch Github Documentation}. Watches specified directory. If changes are made, the grunt newer task is ran, which compares the src and dest directories. If the changed file is newer than the same version in dest, it will run the attached tasks.
 * @property {Object} project Runs the watchcopyframework, watchcopyproject, watchcopyvisualizations
 */
module.exports = function(grunt) {
    return {
        project: {
            files: [grunt.dirs.workspacesframework + '**/*.*', grunt.dirs.workspacesprojects + '**/*.*', grunt.dirs.workspacesvisualizations + '/**/*.*'],
            tasks: ['newer:copy:watchcopyframework', 'newer:copy:watchcopyproject', 'newer:copy:watchcopyvisualizations'],
            options: {
                spawn: false,
                // cwd: ('../workspaces/'),
                livereload: true
            }
        }
    }
}
