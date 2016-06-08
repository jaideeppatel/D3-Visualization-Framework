'use strict';
/**
 * @namespace grunt
 * @type {Object}
 * @description Something
 */
/**
 * @namespace grunt.config
 * @type {Object}
 * @description Something
 */
module.exports = function(grunt) {
    grunt.dirs = {
        'workspaces': '../workspaces/',
        'deploy': 'deploy/',
        'workspacesframework': '../workspaces/framework/',
        'workspacesprojects': '../workspaces/projects/',
        'workspacesvisualizations': '../workspaces/visualizations/'
    }

    require('load-grunt-config')(grunt);
    var shell = require('shelljs');

    /** 
        @memberOf grunt.config.data
        @description The URL of the working Framework repository for various build tasks.
    */
    grunt.config.data.baseURL = grunt.option('baseURL')
        /** 
            @memberOf grunt.config.data
            @description A commit ID for various Git related tasks. 
        */
    grunt.config.data.commitID = grunt.option('commitID')
        /** 
            @memberOf grunt.config.data
            @description The URL of the working Plugins repository for various build tasks. 
        */
    grunt.config.data.pluginsURL = grunt.option('pluginsURL')
        /**  
            @memberOf grunt.config.data
            @description An alias name for a  project that is used to reference a specific project and name workspace/deployment directories.
        */
    grunt.config.data.projectName = grunt.option('projectName')
        /** 
            @memberOf grunt.config.data
            @description The URL of the working Projects directory for various build tasks.
        */
    grunt.config.data.projectURL = grunt.option('projectURL')
        /** 
            @memberOf grunt.config.data
            @description An alias for a visualization. This is for instanced visulizations. This value should be unique among other visualization names in the working project. 
        */
    grunt.config.data.visualizationAlias = grunt.option('visualizationAlias')
        /** 
            @memberOf grunt.config.data
            @description Reference to the visualization name. Same as the directory name in the Plugins repository.
        */
    grunt.config.data.visualizationName = grunt.option('visualizationName')

    /**
     * @name set-config-file
     * @memberOf  tasks
     * @type {Task}
     * @description If the config-dir argument has been set and points to a JSON object file, the keys of the JSON object will be set as options, and their values associated. This allows the user to write the options once and use them every time a task runs adding only one argument, as opposed to 6+.
     */
    grunt.registerTask('set-config-file', function() {
        if (grunt.option('config-dir')) {
            var obj = grunt.file.readJSON(grunt.option('config-dir'));
            Object.keys(obj).forEach(function(d, i) {
                grunt.config.data[d] = obj[d];
            })
        }
    });


    grunt.registerTask('include-visualization', [
        'prompt:projectname',
        'prompt:visualizationname',
        'prompt:visualizationalias',
        'prompt:pluginsurl',
        'prompt:commitid',
        'include-visualization-sub',
        'mkdir:projectvisualization',
        'exec:createvisualization',
        'exec:fetchvisualization',
        'create-vis-config'
    ])
    grunt.registerTask('include-visualization-sub', function() {
        var projectName = grunt.template.process('<%= projectName %>');
        var visualizationName = grunt.template.process('<%= visualizationName %>');
        var visualizationAlias = grunt.template.process('<%= visualizationAlias %>');
        var commitID = grunt.template.process('<%= commitID %>');
        var obj = grunt.file.readJSON((grunt.dirs.workspacesprojects + projectName + '/visuals/visincludes.json'));
        obj.data[visualizationName] = {
            "visualization": visualizationName,
            "alias": visualizationAlias,
            "commit": commitID
        }
        grunt.file.write((grunt.dirs.workspacesprojects + projectName + '/visuals/visincludes.json'), JSON.stringify(obj))

    })


    /**
     * @name build-project-visualizations
     * @memberOf  tasks
     * @type {Task}
     * @description Reads the ../workspaces/projects/{@link grunt.config.data.projectName}/visuals/visincludes.json file. Creates a ../workspaces/visualizations/{@link grunt.config.data.projectName} directory. For each of the listed visualizations in the visincludes file, perform a sparseCheckout of the {@link grunt.config.data.pluginsURL} repository.
     */
    grunt.registerTask('build-project-visualizations', function() {
        var projectName = grunt.template.process('<%= projectName %>');
        var pluginsURL = grunt.template.process('<%= pluginsURL %>');
        grunt.task.run(['mkdir:projectvisualizationworkspace'])

        var obj = grunt.file.readJSON((grunt.dirs.workspacesprojects + projectName + '/visuals/visincludes.json'));
        Object.keys(obj.data).forEach(function(d, i) {
            grunt.config.data.mkdir['projectvisualization' + obj.data[d].visualization] = {
                options: {
                    create: [grunt.dirs.workspacesvisualizations + projectName + '/' + obj.data[d].visualization]
                }
            }
            grunt.config.data.exec['initprojectvisualizations' + obj.data[d].visualization] = {
                cmd: [
                    'git init',
                    'git config core.sparseCheckout true',
                    'echo ' + obj.data[d].visualization + '/*>> .git/info/sparse-checkout',
                    'git remote add -f origin ' + pluginsURL,
                    'git fetch origin ' + (obj.data[d].commit || 'master'),
                    'git reset --hard FETCH_HEAD'
                ].join('&&'),
                cwd: grunt.dirs.workspacesvisualizations + projectName + '/' + obj.data[d].visualization
            }
            grunt.task.run(['mkdir:projectvisualization' + obj.data[d].visualization])
            grunt.task.run(['exec:initprojectvisualizations' + obj.data[d].visualization])

        });
    });

    grunt.task.run(['set-config-file']);

    /**
     * @name initproject
     * @memberOf  tasks
     * @type {Task}
     * @description Creates ../workspaces/visualizations/{@link grunt.config.data.projectName}
     */
    grunt.registerTask('initproject', function() {
        grunt.task.run(['mkdir:projectworkspace'])
        grunt.task.run(['exec:initproject'])
    });

    /**
     * @name create-visualization
     * @memberOf  tasks
     * @type {Task}
     * @description Creates ../workspaces/visualizations/{@link grunt.config.data.projectName} and ../workspaces/visualizations/{@link grunt.config.data.projectName}/{@link grunt.config.data.visualizationName} and hooks up the remote repository. 
     */
    grunt.registerTask('create-visualization', [
        'prompt:projectname',
        'prompt:pluginsurl',
        'prompt:visualizationname',
        'mkdir:projectvisualizationworkspace',
        'mkdir:projectvisualization',
        'exec:createvisualization',
        'copy:vistemplate'
    ]);
    /**
     * @name watch-proj
     * @memberOf  tasks
     * @type {Task}
     * @description Runs the {@link gruntconfig.watch} task on the project directory
     */
    grunt.registerTask('watch-proj', [
        'watch:project'
    ]);
    /**
     * @name watch-vis
     * @memberOf  tasks
     * @type {Task}
     * @description Runs the {@link gruntconfig.watch} task on the visualizations directory directory
     */
    grunt.registerTask('watch-vis', [
        'watch:visualizations'
    ]);
    /**
     * @name build-project-files
     * @memberOf  tasks
     * @type {Task}
     * @description Create a project by creating a workspace based on the {@link grunt.config.data.projectName} argument. Runs the {@link gruntconfig.mkdir} task on the projects directory and creates the project with {@link tasks.initproject}.
     */
    grunt.registerTask('build-project-files', [
        'mkdir:projectworkspace',
        'initproject'
    ]);
    // grunt.registerTask('create-visualization', ['prompt:projectname', 'prompt:pluginsurl', 'prompt:visualizationname', 'create-vis'])
    grunt.registerTask('fetch-project-files', [
        'prompt:projectname',
        'prompt:projecturl',
        'clean:project',
        'mkdir:projectworkspace',
        'build-project-files'
    ]);
    grunt.registerTask('fetch-project-visuals', [
        'prompt:projectname',
        'prompt:pluginsurl',
        'clean:visualization',
        'mkdir:visworkspace',
        'build-project-visualizations'
    ]);
    grunt.registerTask('build-framework',
        'Clean the directory and copy the framework code to the deployment directory.', [
            'prompt:projectname',
            'clean:deploy',
            'copy:framework'
        ]);
    grunt.registerTask('fetch-projectect',
        'Fetch the project code from the remote repository, read the visIncludes.json file and fetch the corresponding visualizations. ' [
            'fetch-project-files',
            'fetch-project-visuals'
        ]);
    grunt.registerTask('clean-workspace', 'Cleans the workspace', [
        'clean:projects',
        'clean:visualizations',
        'clean:deploys',
        'mkdir:workspace'
    ]);
    grunt.registerTask('create-project', [
        'prompt:projectname',
        'prompt:projecturl',
        'mkdir:projectworkspace',
        'mkdir:projectvisualizationworkspace',
        'copy:strippedframework'
    ]);
    grunt.registerTask('create-vis-config', [
        'prompt:projectname',
        'prompt:visualizationname',
        'prompt:visualizationalias',
        'copy:visconfigtemplate'
    ]);
    grunt.registerTask('build-project-full', [
        'prompt:projectname',
        'prompt:projecturl',
        'prompt:pluginsurl',
        'build-framework',
        'fetch-project-files',
        'fetch-project-visuals',
        'copy:project',
        'copy:visualizations'
    ]);
    grunt.registerTask('build-project', [
        'prompt:projectname',
        'copy:framework',
        'copy:project',
        'copy:visualizations',
        // 'register-deploy-scripts'
    ]);
    grunt.registerTask('webserver', [
        'web_server',
        'open:deploy'
    ]);
};



//Task status
//Working:
//  create-project
//  create-visualization
