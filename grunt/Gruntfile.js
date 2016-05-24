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
    require('load-grunt-tasks')(grunt);

    function loadConfig(path) {
        var glob = require('glob');
        var object = {};
        var key;
        glob.sync('*', {
            cwd: path
        }).forEach(function(option) {
            key = option.replace(/\.js$/, '');
            object[key] = require(path + option);
        });
        return object;
    }

    /**
     * @namespace grunt.config.data
     * @type {Object}
     * @description Something
     */

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

    var path = require('path');
	/**
	 * @namespace gruntconfig
	 * @type {Object}
	 * @description Object containing all registered Grunt task configs.
	 */    
    var config = {
        pkg: grunt.file.readJSON('package.json'),
		/**
         * @memberOf gruntconfig
		 * @type {Object}
		 * @description Starts a localhost web server.
		 */         
        web_server: {
            options: {
                cors: true,
                port: 8000,
                nevercache: true,
                logRequests: true,
                base: '../deploy'
            },
            foo: 'bar' // For some reason an extra key with a non-object value is necessary 
        },
        shell: {},
        /**
         * @memberOf gruntconfig
		 * @type {Object}
		 * @property {Array} deploys Cleans the entire deployment directory.
		 * @property {Array} deploy Cleans the deploy/{@link grunt.config.data.projectName} directory.
		 * @property {Array} projects Cleans the entire ../workspaces/projects directory.
		 * @property {Array} project Cleans the ../workspaces/projects/{@link grunt.config.data.projectName} directory.
		 * @property {Array} visualizations Cleans the entire ../workspaces/visualizations directory.
		 * @property {Array} visualization Cleans the ../workspaces/visualizations/{@link grunt.config.data.projectName} directory.
		 * @description Removes specified directory and all contents of that directory. If the {@link web_server} task is running or if the files are in use, this task will fail.
		 */  
        clean: {
            deploys: ['deploy/'],
            deploy: [('deploy/' + '<%= projectName %>')],
            projects: ['../workspaces/projects'],
            project: [('../workspaces/projects/' + '<%= projectName %>')],
            visualizations: ['../workspaces/visualizations/'],
            visualization: ['../workspaces/visualizations/' + '<%= projectName %>'],
            options: {
                force: true
            }
        },
        /**
         * @memberOf gruntconfig
		 * @type {Object}
		 * @description Copies directories or files from the src directory to the dest directory.
 		 * @property {Object} framework Copies ../workspaces/framework to deploy/{@link grunt.config.data.projectName}. Used for project deployment. 
 		 * @property {Object} strippedframework Same as the framework task, but excludes certain directories to give a more pure copy. Used to create new projects with the framework's template.
 		 * @property {Object} project Copies ../workspaces/projects/{@link grunt.config.data.projectName} to /deploy. Used to deploy projects.
 		 * @property {Object} visualizations Copies ../workspaces/visualizations/{@link grunt.config.data.projectName} to /deploy. Used to deploy projects. Excludes extraneous files.
 		 * @property {Object} vistemplate Copies ../templates/generatedVisContent to ../workspaces/projects/{@link grunt.config.data.projectName}/visuals. Replaces string placeholders with {@link grunt.config.data.projectName}, {@link grunt.config.data.visualizationAlias}, and {@link grunt.config.data.visualizationName} respectively.
 		 * @property {Object} watchcopyproject Same as the copy project task, but used for the watch task.
 		 * @property {Object} watchcopyframework Same as the copy framework task, but used for the watch task.
 		 * @property {Object} watchcopyvisualizations Same as the copy visualizations task, but used for the watch task.
		 */  
        copy: {
            framework: {
                expand: true,
                cwd: '../workspaces/framework',
                src: ['**/*'],
                dest: ('deploy/' + '<%= projectName %>')
            },
            strippedframework: {
                expand: true,
                cwd: '../workspaces/framework',
                src: ['**/*', '!lib/*', '!src/*', 'src/tmp/', 'src/DatasourceMap.js'],
                dest: ('../workspaces/projects/' + '<%= projectName %>' + '/')
            },
            project: {
                expand: true,
                cwd: ('../workspaces/projects/' + '<%= projectName %>' + '/'),
                src: ['**/*'],
                dest: ('deploy/' + '<%= projectName %>')
            },
            // Copies src files to dest
            visualizations: {
                expand: true,
                cwd: ('../workspaces/visualizations/' + '<%= projectName %>'),
                src: ['**/*.js', '**/*.json', '!**/visincludes.json', '!**/*-config.js'],
                dest: ('deploy/' + '<%= projectName %>' + '/visuals'),
                flatten: false
            },
            //Copies templates and replaces placeholders with paramater values 
            vistemplate: {
                expand: true,
                // cwd: 'visualizations-workspace/' + '<%= visualizationName %>' + '/' + '<%= visualizationName %>',
                src: ['../templates/generatedVisContent/*'],
                dest: ('../workspaces/projects/' + '<%= projectName %>' + '/visuals'),
                rename: function(dest, srcPath) {
                    return dest + '/' + srcPath.replace(/\bVISALIAS\b/g, grunt.template.process('<%= projectName %>'));
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
            watchcopyproject: {
                expand: true,
                dot: true,
                cwd: ('../workspaces/projects/' + '<%= projectName %>'),
                src: ['**/*.*', '!.git/'],
                dest: ('deploy/' + '<%= projectName %>')
            },
            watchcopyframework: {
                expand: true,
                dot: true,
                cwd: ('../workspaces/framework/'),
                src: ['**/*.*', '!.git/'],
                dest: ('deploy/' + '<%= projectName %>'),
            },
            watchcopyvisualizations: {
                expand: true,
                dot: true,
                cwd: ('../workspaces/visualizations/' + '<%= projectName %>'),
                src: ['**/*.*', '!.git/'],
                //TODO: This doesn't point to the correct location .Fix and test.
                dest: ('deploy/' + '<%= projectName %>' + '/visuals'),
            }
        },
        /**
         * @memberOf gruntconfig
		 * @type {Object}
		 * @description Watches specified directory. If changes are made, the grunt newer task is ran, which compares the src and dest directories. If the changed file is newer than the same version in dest, it will run the attached tasks.
 		 * @property {Object} project Runs the watchcopyframework, watchcopyproject, watchcopyvisualizations
		 */          
        watch: {
            project: {
                files: ['framework/**/*.*', 'projects/**/*.*', 'visualizations/**/*.*'],
                tasks: ['newer:copy:watchcopyframework', 'newer:copy:watchcopyproject', 'newer:copy:watchcopyvisualizations'],
                options: {
                    spawn: false,
                    cwd: ('../workspaces/'),
                    livereload: true
                },
            },
        },
        prompt: {
            configdir: {
                options: {
                    questions: [{
                        config: 'configdir',
                        type: 'input',
                        message: 'Please enter the config file location:',
                        when: function(answers) {
                            if (grunt.config.data.configdir) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            visualizationname: {
                options: {
                    questions: [{
                        config: 'visualizationName',
                        type: 'input',
                        message: 'Please enter the visualization name (Same as top level folder in repository):',
                        when: function(answers) {
                            if (grunt.config.data.visualizationName) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            commitid: {
                options: {
                    questions: [{
                        config: 'commitID',
                        type: 'input',
                        message: 'Please enter the commit id:',
                        when: function(answers) {
                            if (grunt.config.data.commitID) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            visualizationalias: {
                options: {
                    questions: [{
                        config: 'visualizationAlias',
                        type: 'input',
                        message: 'Please enter the visualization alias (Should be unique to prevent issues):',
                        when: function(answers) {
                            if (grunt.config.data.visualizationAlias) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            projectname: {
                options: {
                    questions: [{
                        config: 'projectName',
                        type: 'input',
                        message: 'Please enter the project name (alias):',
                        when: function(answers) {
                            if (grunt.config.data.projectName) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            baseurl: {
                options: {
                    questions: [{
                        config: 'baseURL',
                        type: 'input',
                        message: 'Please enter the framework base repo URL:',
                        when: function(answers) {
                            if (grunt.config.data.baseURL) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            pluginsurl: {
                options: {
                    questions: [{
                        config: 'pluginsURL',
                        type: 'input',
                        message: 'Please enter the plugins repo URL:',
                        when: function(answers) {
                            if (grunt.config.data.pluginsURL) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            },
            projecturl: {
                options: {
                    questions: [{
                        config: 'projectURL',
                        type: 'input',
                        message: 'Please enter the project repo URL:',
                        when: function(answers) {
                            if (grunt.config.data.projectURL) return false;
                            return true;
                        }
                    }],
                    then: function() {}
                }
            }
        },
        mkdir: {
            workspace: {
                options: {
                    create: ['deploy', '../workspaces/projects', '../workspaces/visualizations']
                },
            },
            visworkspace: {
                options: {
                    create: ['../workspaces/visualizations']
                },
            },
            projectworkspace: {
                options: {
                    create: ['../workspaces/projects/<%= projectName %>']
                },
            },
            projectvisualizationworkspace: {
                options: {
                    create: ['../workspaces/visualizations/<%= projectName %>']
                },
            },
        },
        jsdoc: {
            dist: {
                src: ['../workspaces/framework/**/*.js', '!../workspaces/framework/**/lib/'],
                options: {
                    destination: 'deploy/doc',
                    // template : 'node_modules/ink-docstrap/template',
                    // configure : 'node_modules/ink-docstrap/template/jsdoc.conf.json'
                }
            },
            grunt: {
                src: ['Gruntfile.js'],
                options: {
                    destination: 'deploy/grunt-doc',
                    // template : 'node_modules/ink-docstrap/template',
                    // configure : 'node_modules/ink-docstrap/template/jsdoc.conf.json'
                }
            }            
        },
    }


    grunt.loadTasks('tasks');
    //Load all tasks in array
    ['grunt-jsdoc', 'grunt-peon-gui', 'grunt-shell', 'grunt-contrib-copy',
        'grunt-contrib-clean', 'grunt-contrib-jshint', 'grunt-contrib-watch',
        'grunt-jslint', 'grunt-jsbeautifier', 'grunt-folder-list', 'grunt-web-server',
        'grunt-contrib-watch', 'grunt-newer', 'grunt-prompt', 'grunt-mkdir', 'grunt-available-tasks'
    ].forEach(function(d) {
        grunt.loadNpmTasks(d);
    });
    grunt.initConfig(config);
    var shell = require('shelljs');

	/**
	 * @namespace tasks
	 * @type {Object}
	 * @description Predefined workflows for basic development, deployment, and build tasks. 
	 */

	/**
	 * @namespace set-config-file
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

	/**
	 * @namespace build-project-visualizations
	 * @memberOf  tasks
	 * @type {Task}
	 * @description Reads the ../workspaces/projects/{@link grunt.config.data.projectName}/visuals/visincludes.json file. Creates a ../workspaces/visualizations/{@link grunt.config.data.projectName} directory. For each of the listed visualizations in the visincludes file, perform a sparseCheckout of the {@link grunt.config.data.pluginsURL} repository.
	 */    
    grunt.registerTask('build-project-visualizations', function() {
        var projectName = grunt.template.process('<%= projectName %>');
        var pluginsURL = grunt.template.process('<%= pluginsURL %>');
        grunt.task.run(['mkdir:projectvisualizationworkspace'])
        var obj = grunt.file.readJSON(('../workspaces/projects/' + projectName + '/visuals/visincludes.json'));
        Object.keys(obj.data).forEach(function(d, i) {
            grunt.config.data.mkdir['projectvisualization' + obj.data[d].visualization] = {
                options: {
                    create: ['../workspaces/visualizations/' + projectName + '/' + obj.data[d].visualization]
                }
            }
            grunt.config.data.shell['initprojectvisualizations' + obj.data[d].visualization] = {
                command: [
                    'git init',
                    'git config core.sparseCheckout true',
                    'echo ' + obj.data[d].visualization + '/*>> .git/info/sparse-checkout',
                    'git remote add -f origin ' + pluginsURL,
                    'git fetch origin ' + (obj.data[d].commit || 'master'),
                    'git reset --hard FETCH_HEAD'
                ].join('&&'),
                options: {
                    execOptions: {
                        stderr: false,
                        cwd: '../workspaces/visualizations/' + projectName + '/' + obj.data[d].visualization
                    }
                }
            }
            grunt.task.run(['mkdir:projectvisualization' + obj.data[d].visualization])
            grunt.task.run(['shell:initprojectvisualizations' + obj.data[d].visualization])

        });
    });

	/**
	 * @namespace create-visualization
	 * @memberOf  tasks
	 * @type {Task}
	 * @description Creates ../workspaces/visualizations/{@link grunt.config.data.projectName} and ../workspaces/visualizations/{@link grunt.config.data.projectName}/{@link grunt.config.data.visualizationName} and hooks up the remote repository. 
	 */    
    grunt.registerTask('create-visualization', function() {
        var projectName = grunt.template.process('<%= projectName %>');
        var pluginsURL = grunt.template.process('<%= pluginsURL %>');
        var visualizationName = grunt.template.process('<%= visualizationName %>');
        grunt.task.run(['mkdir:projectvisualizationworkspace'])
        shell.exec([
            'cd ../workspaces/visualizations/' + projectName,
            'mkdir ' + visualizationName,
            'cd ' + visualizationName,
            'git init',
            'git config core.sparseCheckout true',
            'echo ' + visualizationName + '/*>> .git/info/sparse-checkout',
            'git remote add -f origin ' + pluginsURL,
            'git reset --hard FETCH_HEAD'
        ].join('&&'));
    });
    grunt.task.run(['set-config-file']);
	/**
	 * @namespace initproject
	 * @memberOf  tasks
	 * @type {Task}
	 * @description Creates ../workspaces/visualizations/{@link grunt.config.data.projectName}
	 */        
    grunt.registerTask('initproject', function() {
        var projectName = grunt.template.process('<%= projectName %>');
        var projectURL = grunt.template.process('<%= projectURL %>');
        var commitID = grunt.template.process('<%= commitID %>');
        shell.exec([
            'cd ../workspaces/projects/' + projectName,
            'git init',
            'git remote add -f origin ' + projectURL,
            ('git fetch origin ' + (commitID || 'master')),
            'git reset --hard FETCH_HEAD'
        ].join('&&'));
    });

    grunt.registerTask('register-deploy-scripts', [ /*'folder_list'*/ ]);
	/**
	 * @namespace watch-proj
	 * @memberOf  tasks
	 * @type {Task}
	 * @description Runs the {@link gruntconfig.watch} task on the project directory
	 */  
    grunt.registerTask('watch-proj', ['watch:project']);
	/**
	 * @namespace watch-vis
	 * @memberOf  tasks
	 * @type {Task}
	 * @description Runs the {@link gruntconfig.watch} task on the visualizations directory directory
	 */
    grunt.registerTask('watch-vis', ['watch:visualizations']);
    /**
	 * @namespace build-project-files
	 * @memberOf  tasks
	 * @type {Task}
	 * @description Create a project by creating a workspace based on the {@link grunt.config.data.projectName} argument. Runs the {@link gruntconfig.mkdir} task on the projects directory and creates the project with {@link tasks.initproject}.
	 */
    grunt.registerTask('build-project-files', ['mkdir:projectworkspace', 'initproject']);
    grunt.registerTask('create-project-visualization', ['prompt:projectname', 'prompt:pluginsurl', 'prompt:visualizationname', 'create-visualization'])
    grunt.registerTask('fetch-proj-files', ['prompt:projectname', 'prompt:projecturl', 'clean:project', 'mkdir:projectworkspace', 'build-project-files']);
    grunt.registerTask('fetch-proj-visuals', ['prompt:projectname', 'prompt:pluginsurl', 'clean:visualization', 'mkdir:visworkspace', 'build-project-visualizations']);
    grunt.registerTask('build-framework', 'Clean the directory and copy the framework code to the deployment directory.', ['prompt:projectname', 'clean:deploy', 'copy:framework']);
    grunt.registerTask('fetch-project', 'Fetch the project code from the remote repository, read the visIncludes.json file and fetch the corresponding visualizations. ' ['fetch-proj-files', 'fetch-proj-visuals']);
    grunt.registerTask('clean-workspace', 'Cleans the workspace', ['clean:projects', 'clean:visualizations', 'clean:deploys', 'mkdir:workspace']);
    grunt.registerTask('create-project', ['prompt:projectname', 'prompt:projecturl', 'mkdir:projectworkspace', 'copy:strippedframework']);
    grunt.registerTask('create-vis-config', ['prompt:projectname', 'prompt:visualizationname', 'prompt:visualizationalias', 'copy:vistemplate']);
    grunt.registerTask('build-project-full', ['prompt:projectname', 'prompt:projecturl', 'prompt:pluginsurl', 'build-framework', 'fetch-proj-files', 'fetch-proj-visuals', 'copy:project', 'copy:visualizations', 'register-deploy-scripts']);
    grunt.registerTask('build-project', ['prompt:projectname', 'copy:framework', 'copy:project', 'copy:visualizations', 'register-deploy-scripts']);
    grunt.registerTask('webserver', ['web_server', 'open:deploy']);
};