'use strict';
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

    grunt.config.data.baseURL = grunt.option('baseURL')
    grunt.config.data.commitID = grunt.option('visualizationAlias')
    grunt.config.data.pluginsURL = grunt.option('pluginsURL')
    grunt.config.data.projectName = grunt.option('projectName')
    grunt.config.data.projectURL = grunt.option('projectURL')
    grunt.config.data.visualizationAlias = grunt.option('visualizationAlias')
    grunt.config.data.visualizationName = grunt.option('visualizationName')

    var path = require('path');
    var config = {
        pkg: grunt.file.readJSON('package.json'),
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
        // Deletes specified folders.
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
        //Copies src directory to dest
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
                dest: ('../workspaces/projects/' + '<%= projectName %>' + '/' + '<% visualizationName %>')
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
            //Runs copy tasks 
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
        //Watches specified folders and run tasks when a file is changed.
        //Newer is a task that compares timestamps of two compared files and runs tasks if the compared file is
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
    grunt.registerTask('set-config-file', function() {
        if (grunt.option('config-dir')) {
            var obj = grunt.file.readJSON(grunt.option('config-dir'));
            Object.keys(obj).forEach(function(d, i) {
                grunt.config.data[d] = obj[d];
            })
        }
    });
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
    //Creates a directory with the name of the 'project' parameter
    //Moves into the new directory
    //Creates a git project
    //Enables and configures sparseCheckout
    //Adds the 'project' parameter to the sparseCheckout (so we only check out the right project).
    //Adds the remote repository
    //Fetches and resets the remote repository
    grunt.task.run(['set-config-file']);
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
    grunt.registerTask('watch-proj', ['watch:project']);
    grunt.registerTask('watch-vis', ['watch:visualizations']);
    grunt.registerTask('build-project-files', ['mkdir:projectworkspace', 'initproject']);
    grunt.registerTask('create-project-visualization', ['prompt:projectname', 'prompt:pluginsurl', 'prompt:visualizationname', 'create-visualization'])
    grunt.registerTask('fetch-proj-files', ['prompt:projectname', 'prompt:projecturl', 'clean:project', 'mkdir:projectworkspace', 'build-project-files']);
    grunt.registerTask('fetch-proj-visuals', ['prompt:projectname', 'prompt:pluginsurl', 'clean:visualization', 'mkdir:visworkspace', 'build-project-visualizations']);
    grunt.registerTask('build-framework', 'Clean the directory and copy the framework code to the deployment directory.', ['prompt:projectname', 'clean:deploy', 'copy:framework']);
    grunt.registerTask('fetch-project', 'Fetch the project code from the remote repository, read the visIncludes.json file and fetch the corresponding visualizations. ' ['fetch-proj-files', 'fetch-proj-visuals']);
    grunt.registerTask('clean-workspace', 'Cleans the workspace', ['clean:projects', 'clean:visualizations', 'clean:deploys', 'mkdir:workspace']);
    grunt.registerTask('create-project', ['prompt:projectname', 'prompt:projecturl', 'mkdir:projectworkspace', 'initproject', 'copy:strippedframework']);
    grunt.registerTask('create-vis-config', ['prompt:projectname', 'prompt:visualizationname', 'prompt:visualizationalias', 'copy:vistemplate']);
    grunt.registerTask('build-project-full', ['prompt:projectname', 'prompt:projecturl', 'prompt:pluginsurl', 'build-framework', 'fetch-proj-files', 'fetch-proj-visuals', 'copy:project', 'copy:visualizations', 'register-deploy-scripts']);
    grunt.registerTask('build-project', ['prompt:projectname', 'copy:framework', 'copy:project', 'copy:visualizations', 'register-deploy-scripts']);
    grunt.registerTask('webserver', ['web_server', 'open:deploy']);
};























// function createPromptTasks() {
//     var prompts = [
//         {
//             name: 'configdir',
//             config: 'configdir',
//             type: 'input',
//             message: 'Please enter the config file location:'
//         },
//         {
//             name: 'visualizationname',
//             config: 'visualizationName',
//             type: 'input',
//             message: 'Please enter the visualization name (Same as top level folder in repository):'
//         },
//         {
//             name: 'commitid',
//             config: 'commitID',
//             type: 'input',
//             message: 'Please enter the commit id:'
//         },
//         {
//             name: 'visualizationalias',
//             config: 'visualizationAlias',
//             type: 'input',
//             message: 'Please enter the visualization alias (Should be unique to prevent issues):'
//         },
//         {
//             name: 'projectname',
//             config: 'projectName',
//             type: 'input',
//             message: 'Please enter the project name (alias):'
//         },
//         {
//             name: 'baseurl',
//             config: 'baseURL',
//             type: 'input',
//             message: 'Please enter the framework base repo URL:'
//         },
//         {
//             name: 'pluginsurl',
//             config: 'pluginsURL',
//             type: 'input',
//             message: 'Please enter the plugins repo URL:'
//         },
//         {
//             name: 'projecturl',
//             config: 'projectURL',
//             type: 'input',
//             message: 'Please enter the project repo URL:'
//         }
//     ]
//     config.prompt = {};
//     prompts.forEach(function(d, i) {
//         config.prompt[d.name] = {
//             options: {
//                 questions: [{
//                     config: d.config,
//                     type: d.type,
//                     message: d.message,
//                     when: function(answers) {
//                         if (grunt.config.data.configdir) return false;
//                         return true;
//                     }
//                 }],
//                 then: function() {}
//             }        
//         }
//     });
// }
