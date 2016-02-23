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
    var path = require('path');
    var config = {

        //TODO: Prompt option for forking everything to user's account
        // projectrepo: '',
        // visualizationsrepo: '',
        // frameworkrepo: '',
        // project: '<%= projectName %>',
        alias: '<%= visualizationAlias %>',
        pkg: grunt.file.readJSON('package.json'),
        // vis: grunt.file.readJSON('visincludes.json'),
        web_server: {
            options: {
                cors: true,
                port: 8000,
                nevercache: true,
                logRequests: true
            },
            foo: 'bar' // For some reason an extra key with a non-object value is necessary 

        },
        //Shell scripts
        shell: {
            //Creates a directory with the name of the 'project' parameter
            //Moves into the new directory
            //Creates a git project
            //Enables and configures sparseCheckout
            //Adds the 'project' parameter to the sparseCheckout (so we only check out the right project).
            //Adds the remote repository
            //Fetches and resets the remote repository
            //TODO: This might change to a full checkout from an exclusive repo so clients cannot bleed into other projects
            initproject: {
                command: [
                    // 'mkdir ' + '<%= projectName %>',
                    // 'cd ' + '<%= projectName %>',
                    // 'git init',
                    // 'git config core.sparseCheckout true',
                    // 'echo ' + '<%= projectName %>' + '/*>> .git/info/sparse-checkout',
                    // 'git remote add -f origin ' + '<%= projectURL %>',
                    // 'git fetch origin ' + ('<%= commitID %>' || 'master'),
                    // 'git reset --hard FETCH_HEAD'
                    ('mkdir ' + '<%= projectName %>'),
                    ('cd ' + '<%= projectName %>'),
                    'git init',
                    // 'git config core.sparseCheckout true',
                    // 'echo ' + '<%= projectName %>' + '/*>> .git/info/sparse-checkout',
                    'git remote add -f origin ' + '<%= projectURL %>',
                    'git fetch origin ' + ('<%= commitID %>' || 'master'),
                    'git reset --hard FETCH_HEAD'
                ].join('&&'),
                options: {
                    execOptions: {
                        stderr: false,
                        cwd: 'workspaces/projects'
                    }
                }
            },
            //Creates a new project. Must be checked into the remote repository before performing a full build
            //Creates a directory with the name of the 'project' parameter
            //Moves into the new directory
            //Creates a git project
            //Enables and configures sparseCheckout
            //Adds the 'project' parameter to the sparseCheckout (so we only check out the right project).
            //Adds the remote repository
            createproject: {
                options: {
                    execOptions: {
                        stderr: false,
                        cwd: 'workspaces/projects'
                    },
                },
                command: [
                    //TODO: If projectrepo options is not specified, ignore
                    ('mkdir ' + '<%= projectName %>'),
                    ('cd ' + '<%= projectName %>'),
                    'git init',
                    // if ('<%= projectURL %>'
                    'git remote add -f origin ' + ('<%= projectURL %>')
                    // 'mkdir ' + '<%= projectName %>'
                ].join('&&')
            }
        },
        //Lists all .js, .json, and .css files in the project deployment directory. 
        //Writes the files to a JSON object so Head.js can load them. 
        folder_list: {
            default_options: {
                options: {
                    files: true,
                    folder: true,
                    encoding: 'string'
                },
                files: [{
                    src: ['**/*.js', '**/*.json', '**/*.css'],
                    dest: ('deploy/' + '<%= projectName %>' + '/src/tmp/includes.json'),
                    cwd: ('deploy/' + '<%= projectName %>' + '/')
                }]
            },
        },
        // Deletes specified folders.
        clean: {
            deploys: ['deploy/'],
            deploy: [('deploy/' + '<%= projectName %>')],
            projects: ['workspaces/projects'],
            project: [('workspaces/projects/' + '<%= projectName %>')],
            visualizations: ['workspaces/visualizations/'],
            visualization: ['workspaces/visualizations/' + '<%= visualizationName %>']
        },
        //Copies src directory to dest
        copy: {
            //TODO: Nah. Big copy, big hassle, no time
            backupdeploy: {
                expand: true,
                cwd: 'deploy/',
                src: ['**/*'],
                dest: ('backup-deploy/'),
            },
            framework: {
                expand: true,
                cwd: 'workspaces/framework',
                src: ['**/*'],
                dest: ('deploy/' + '<%= projectName %>'),
            },
            //TODO: Change name
            framework2: {
                expand: true,
                cwd: 'workspaces/framework',
                src: ['**/*', '!lib/*', '!src/*', 'src/tmp/', 'src/DatasourceMap.js'],
                dest: ('workspaces/projects/' + '<%= projectName %>' + '/'),
            },
            project: {
                expand: true,
                cwd: ('workspaces/projects/' + '<%= projectName %>' + '/'),
                src: ['**/*'],
                dest: ('deploy/' + '<%= projectName %>'),
            },
            // Copies src files to dest
            visualizations: {
                expand: true,
                cwd: ('workspaces/visualizations/' + '<%= projectName %>'),
                src: ['**/*.js', '**/*.json', '!**/visincludes.json', '!**/*-config.js'],
                dest: ('deploy/' + '<%= projectName %>' + '/visuals'),
                flatten: false
            },
            //Copies templates and replaces placeholders with paramater values 
            vistemplate: {
                expand: true,
                // cwd: 'visualizations-workspace/' + '<%= visualizationName %>' + '/' + '<%= visualizationName %>',
                src: ['templates/generatedVisContent/*'],
                dest: ('workspaces/projects/' + '<%= projectName %>' + '/visuals'),
                rename: function(dest, srcPath) {
                    return dest + '/' + srcPath.replace(/\bVISALIAS\b/g, '<%= visualizationAlias %>');
                },
                options: {
                    process: function(content, srcpath) {
                        var cont = content;
                        cont = cont.replace(/\bVISALIASALT\b/g, '<%= visualizationAlias %>'
                            .replace(/(?:^|\.?)([A-Z])/g, function(x, y) {
                                return "_" + y.toLowerCase();
                            }).replace(/^_/, ""));
                        cont = cont.replace(/\bVISALIAS\b/g, '<%= visualizationAlias %>');
                        cont = cont.replace(/\bVISNAME\b/g, '<%= visualizationName %>');
                        return cont;
                    },
                },
                flatten: true
            },
            //Runs copy tasks 
            watchcopyproject: {
                expand: true,
                dot: true,
                cwd: ('workspaces/projects/' + '<%= projectName %>'),
                src: ['**/*.*', '!.git/'],
                dest: ('deploy/' + '<%= projectName %>')
            },
            watchcopyframework: {
                expand: true,
                dot: true,
                cwd: ('workspaces/framework/'),
                src: ['**/*.*', '!.git/'],
                //TODO: This doesn't point to the correct location .Fix and test.
                dest: ('deploy/' + '<%= projectName %>'),
            },
            watchcopyvisualizations: {
                expand: true,
                dot: true,
                cwd: ('workspaces/visualizations/' + '<%= projectName %>'),
                src: ['**/*.*', '!.git/'],
                //TODO: This doesn't point to the correct location .Fix and test.
                dest: ('deploy/' + '<%= projectName %>' + '/visuals'),
            }
        },
        //Watches specified folders and run tasks when a file is changed.
        watch: {
            project: {
                files: ['**/*.*'],
                //Newer is a task that compares timestamps of two compared files and runs tasks if the compared file is
                tasks: ['newer:copy:watchcopyframework', 'newer:copy:watchcopyproject'],
                options: {
                    //nospawn is depricated but kept for compatibility.  use spawn false instead
                    spawn: false,
                    cwd: ('workspaces/projects/' + '<%= projectName %>'),
                    livereload: true
                },
            },
            visualizations: {
                files: ['**/*.*'],
                tasks: ['newer:copy:watchcopyvisualizations'],
                options: {
                    spawn: false,
                    //TODO: Probably needs a matching structure to do this. 
                    cwd: ('workspaces/visualizations/' + '<%= projectName %>'),
                },
            },
            main: {
                files: ['workspaces/framework/*.*', ''],
                options: {
                    cwd: ('deploy/' + '<%= projectName %>'),
                    livereload: true
                },
            },
        },



        prompt: {
            tasks: {
                options: {
                    questions: [{
                        config: 'tasklist',
                        type: 'list', // list, checkbox, confirm, input, password
                        message: 'What would you like to do?',
                        choices: [{
                            value: 'create-project',
                            name: 'Setup a new project',
                            //TODO: Do this for those.
                            dangerous: true
                        }, {
                            value: 'clean-workspace',
                            name: 'Clean the workspace'
                        }, {
                            value: 'register-deploy-scripts',
                            name: 'Generate visualization configuration scripts'
                        }, {
                            value: 'build-project',
                            name: 'Build a project'
                        }, {
                            value: 'build-project-full',
                            name: 'Full build a project'
                        }, {
                            value: 'webserver',
                            name: 'Create a webserver'
                        }],
                        validate: function(value) {
                            return true;
                        }, // return true if valid, error message if invalid. works only with type:input 
                        filter: function(value) {
                            return value;
                        },
                    }, {
                        config: 'projectinput',
                        type: 'input',
                        message: 'Enter project name: ',
                        validate: function(value) {
                            return true;
                        },
                        filter: function(value) {
                            return value;
                        },
                        when: function(answers) {
                            if (['create-project', 'register-deploy-scripts', 'build-project', 'build-project-full'].indexOf(answers.tasklist) > -1) {
                                return true;
                            }
                            return false;
                        }
                    }, {
                        config: 'dangerconfirm',
                        type: 'confirm',
                        message: 'This could potentially be dangerous and irreversible. Are you sure you want to proceed?',
                        validate: function(value) {
                            return true;
                        },
                        filter: function(value) {
                            return value;
                        },
                        when: function(answers) {
                            if (['clean-workspace', 'build-project', 'build-project-full'].indexOf(answers.tasklist) > -1) {
                                return true;
                            }
                            return false;
                        },
                    }],
                    then: function(answers) {
                        // '<%= projectName %>' = answers.configval

                        if (answers.dangerconfirm != false) {
                            grunt.task.run(answers.tasklist);
                        }
                    }
                }
            },

            visualizationname: {
                options: {
                    questions: [{
                        config: 'visualizationName',
                        type: 'input',
                        message: 'Please enter the visualization name (Same as top level folder in repository):',
                    }],
                    then: function() {
                    }
                }
            },
            commitid: {
                options: {
                    questions: [{
                        config: 'commitID',
                        type: 'input',
                        message: 'Please enter the commit id:',
                    }],
                    then: function() {
                    }
                }
            },
            visualizationalias: {
                options: {
                    questions: [{
                        config: 'visualizationAlias',
                        type: 'input',
                        message: 'Please enter the visualization alias (Should be unique to prevent issues):',
                    }],
                    then: function() {
                    }
                }
            },
            projectname: {
                options: {
                    questions: [{
                        config: 'projectName',
                        type: 'input',
                        message: 'Please enter the project name (alias):',
                    }],
                    then: function() {
                    }
                }
            },
            baserepo: {
                options: {
                    questions: [{
                        config: 'baseURL',
                        type: 'input',
                        message: 'Please enter the framework base repo URL:',
                    }],
                    then: function() {
                    }
                }
            },
            pluginsrepo: {
                options: {
                    questions: [{
                        config: 'pluginsURL',
                        type: 'input',
                        message: 'Please enter the plugins repo URL:',
                    }],
                    then: function() {
                    }
                }
            },
            projectrepo: {
                options: {
                    questions: [{
                        config: 'projectURL',
                        type: 'input',
                        message: 'Please enter the project repo URL:',
                    }],
                    then: function() {
                    }
                }
            }
        },
        mkdir: {
            workspace: {
                options: {
                    create: ['deploy', 'workspaces/projects', 'workspaces/visualizations']
                },
            },
        },
        jsdoc: {
            dist: {
                src: ['deploy/**/*.js', '!deploy/**/lib/*.js'],
                options: {
                    destination: 'doc',
                    // template : 'node_modules/ink-docstrap/template',
                    // configure : 'node_modules/ink-docstrap/template/jsdoc.conf.json'

                }
            }
        },
    }

    grunt.loadTasks('tasks');

    //Load all tasks in array
    ['grunt-jsdoc', 'grunt-peon-gui', 'grunt-shell', 'grunt-contrib-copy', 'grunt-contrib-clean', 'grunt-contrib-jshint', 'grunt-contrib-watch', 'grunt-jslint', 'grunt-jsbeautifier', 'grunt-folder-list', 'grunt-web-server', 'grunt-contrib-watch', 'grunt-newer', 'grunt-prompt', 'grunt-mkdir', 'grunt-available-tasks']
    .forEach(function(d) {
        grunt.loadNpmTasks(d);
    });
    // grunt.util._.extend(config, loadConfig('./tasks/lib/'));
    grunt.initConfig(config);

    grunt.registerTask('watch-proj', ['watch:project', 'watch:main']);
    grunt.registerTask('watch-vis', ['watch:visualizations']);
    grunt.registerTask('watch-proj-and-vis', ['watch-proj', 'watch-vis']);
    grunt.registerTask('build-project-files', ['shell:initproject']);
    grunt.registerTask('build-project-visualizations', function() {
        var obj = grunt.file.readJSON(('workspaces/projects/' + '<%= projectName %>' + '/visuals/visincludes.json'));
        grunt.config.data.shell.makeprojdir = {
            command: ('mkdir ' + '<%= projectName %>'),
            options: {
                execOptions: {
                    stderr: false,
                    cwd: 'workspaces/visualizations',
                    spawn: true
                }
            }
        }
        grunt.task.run(['shell:makeprojdir'])
            //TODO: Don't append tasks to config, then run them like a bozo.
        Object.keys(obj.data).forEach(function(d, i) {
            grunt.config.data.shell[obj.data[d].visualization] = {
                command: [
                    'mkdir ' + obj.data[d].visualization,
                    'cd ' + obj.data[d].visualization,
                    'git init',
                    'git config core.sparseCheckout true',
                    'echo ' + obj.data[d].visualization + '/*>> .git/info/sparse-checkout',
                    'git remote add -f origin ' + '<%= projectURL %>',
                    'git fetch origin ' + obj.data[d].commit || 'master',
                    'git reset --hard FETCH_HEAD'
                ].join('&&'),
                options: {
                    execOptions: {
                        stderr: false,
                        cwd: ('workspaces/visualizations/' + '<%= projectName %>')
                    }
                }
            }
            grunt.task.run(['shell:' + obj.data[d].visualization])
        });
    });
    grunt.registerTask('fetch-proj-files', ['prompt:projectname', 'clean:project', 'build-project-files']);
    grunt.registerTask('fetch-proj-visuals', ['prompt:projectname', 'prompt:projectrepos', 'clean:visualization', 'build-project-visualizations']);
    grunt.registerTask('build-framework', 'Clean the directory and copy the framework code to the deployment directory.', ['clean:deploy', 'copy:framework']);
    //TODO: Why does this no longer work?!
    grunt.registerTask('fetch-project', 'Fetch the project code from the remote repository, read the visIncludes.json file and fetch the corresponding visualizations. ' ['fetch-proj-files', 'fetch-proj-visuals']);
    grunt.registerTask('register-deploy-scripts', ['folder_list']);
    grunt.registerTask('clean-workspace', 'Cleans the workspace', ['clean:projects', 'clean:visualizations', 'clean:deploys', 'mkdir:workspace']);
    grunt.registerTask('create-project', ['prompt:projectname', 'prompt:projectrepo', 'clean:project', 'shell:createproject', 'copy:framework2']);
    // TODO: The template strings do not replace the file contents. 
    grunt.registerTask('create-vis-config', ['prompt:projectname', 'prompt:visualizationname', 'prompt:visualizationalias', 'copy:vistemplate']);
    grunt.registerTask('build-project-full', ['prompt:projectname', 'build-framework', 'fetch-proj-files', 'fetch-proj-visuals', 'copy:project', 'copy:visualizations', 'register-deploy-scripts']);
    grunt.registerTask('build-project', ['prompt:projectname', 'copy:framework', 'copy:project', 'copy:visualizations', 'register-deploy-scripts']);
    grunt.registerTask('webserver', ['web_server', 'open:deploy']);
};