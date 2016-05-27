/**
 * @memberOf gruntconfig
 * @type {Object}
 * @description {@link https://www.npmjs.com/package/copy NPM Documentation}. Copies directories or files from the src directory to the dest directory.
 * @property {Object} framework Copies ../workspaces/framework to deploy/{@link grunt.config.data.projectName}. Used for project deployment. 
 * @property {Object} strippedframework Same as the framework task, but excludes certain directories to give a more pure copy. Used to create new projects with the framework's template.
 * @property {Object} project Copies ../workspaces/projects/{@link grunt.config.data.projectName} to /deploy. Used to deploy projects.
 * @property {Object} visualizations Copies ../workspaces/visualizations/{@link grunt.config.data.projectName} to /deploy. Used to deploy projects. Excludes extraneous files.
 * @property {Object} vistemplate Copies ../templates/generatedVisContent to ../workspaces/projects/{@link grunt.config.data.projectName}/visuals. Replaces string placeholders with {@link grunt.config.data.projectName}, {@link grunt.config.data.visualizationAlias}, and {@link grunt.config.data.visualizationName} respectively.
 * @property {Object} watchcopyproject Same as the copy project task, but used for the watch task.
 * @property {Object} watchcopyframework Same as the copy framework task, but used for the watch task.
 * @property {Object} watchcopyvisualizations Same as the copy visualizations task, but used for the watch task.
 */
module.exports = function(grunt) {
    return {
        framework: {
            expand: true,
            cwd: grunt.dirs.workspacesframework,
            src: ['**/*'],
            dest: (grunt.dirs.deploy + '<%= projectName %>')
        },
        strippedframework: {
            expand: true,
            cwd: grunt.dirs.workspacesframework,
            src: ['**/*', '!lib/*', '!src/*', 'src/tmp/', 'src/DatasourceMap.js'],
            dest: (grunt.dirs.workspacesprojects + '<%= projectName %>' + '/')
        },
        project: {
            expand: true,
            cwd: (grunt.dirs.workspacesprojects + '<%= projectName %>' + '/'),
            src: ['**/*'],
            dest: ('deploy/' + '<%= projectName %>')
        },
        // Copies src files to dest
        visualizations: {
            expand: true,
            cwd: (grunt.dirs.workspacesvisualizations + '<%= projectName %>'),
            src: ['**/*.js', '**/*.json', '!**/visincludes.json', '!**/*-config.js'],
            dest: ('deploy/' + '<%= projectName %>' + '/visuals'),
            flatten: false
        },
        //Copies templates and replaces placeholders with paramater values 
        visconfigtemplate: {
            expand: true,
            // cwd: 'visualizations-workspace/' + '<%= visualizationName %>' + '/' + '<%= visualizationName %>',
            src: ['../templates/visConfigTemplates/*'],
            dest: (grunt.dirs.workspacesprojects + '<%= projectName %>' + '/visuals'),
            rename: function(dest, srcPath) {
                return dest + '/' + srcPath.replace(/\bVISALIAS\b/g, grunt.template.process('<%= visualizationAlias %>'));
            },
            options: {
                process: function(content, srcpath) {
                    var cont = content;
                    cont = cont.replace(/\bVISALIASALT\b/g, grunt.template.process('<%= visualizationAlias %>')
                        .replace(/(?:^|\.?)([A-Z])/g, function(x, y) {
                            return "_" + y.toLowerCase();
                        }).replace(/^_/, ""));
                    cont = cont.replace(/\bVISALIAS\b/g, grunt.template.process('<%= visualizationAlias %>'));
                    cont = cont.replace(/\bVISNAME\b/g, grunt.template.process('<%= visualizationName %>'));
                    return cont;
                }
            },
            flatten: true
        },
        vistemplate: {
            expand: true,
            // cwd: 'visualizations-workspace/' + '<%= visualizationName %>' + '/' + '<%= visualizationName %>',
            src: ['../templates/visTemplate/*'],
            dest: (grunt.dirs.workspacesvisualizations + '<%= projectName %>' + '/' + '<%= visualizationName %>'),
            rename: function(dest, srcPath) {
                return dest + '/' + srcPath.replace(/\bVISNAME\b/g, grunt.template.process('<%= visualizationName %>'));
            },
            options: {
                process: function(content, srcpath) {
                    var cont = content;
                    cont = cont.replace(/\bVISNAME\b/g, grunt.template.process('<%= visualizationName %>'));
                    return cont;
                }
            },
            flatten: true
        },        
        watchcopyproject: {
            expand: true,
            dot: true,
            cwd: (grunt.dirs.workspacesprojects + '<%= projectName %>'),
            src: ['**/*.*', '!.git/'],
            dest: (grunt.dirs.deploy + '<%= projectName %>')
        },
        watchcopyframework: {
            expand: true,
            dot: true,
            cwd: (grunt.dirs.workspacesframework),
            src: ['**/*.*', '!.git/'],
            dest: (grunt.dirs.deploy + '<%= projectName %>'),
        },
        watchcopyvisualizations: {
            expand: true,
            dot: true,
            cwd: (grunt.dirs.workspacesvisualizations + '<%= projectName %>'),
            src: ['**/*.*', '!.git/'],
            dest: (grunt.dirs.deploy + '<%= projectName %>' + '/visuals'),
        }
    }
}
