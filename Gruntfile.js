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
        project: grunt.option('project'),
        alias: grunt.option('alias'),
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
                    // 'mkdir ' + grunt.option('project'),
                    // 'cd ' + grunt.option('project'),
                    // 'git init',
                    // 'git config core.sparseCheckout true',
                    // 'echo ' + grunt.option('project') + '/*>> .git/info/sparse-checkout',
                    // 'git remote add -f origin ' + grunt.option('projectrepo'),
                    // 'git fetch origin ' + (grunt.option('commit') || 'master'),
                    // 'git reset --hard FETCH_HEAD'
                    'mkdir ' + grunt.option('project'),
                    'cd ' + grunt.option('project'),
                    'git init',
                    // 'git config core.sparseCheckout true',
                    // 'echo ' + grunt.option('project') + '/*>> .git/info/sparse-checkout',
                    'git remote add -f origin ' + grunt.option('projectrepo'),
                    'git fetch origin ' + (grunt.option('commit') || 'master'),
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
                    'mkdir ' + grunt.option('project'),
                    'cd ' + grunt.option('project'),
                    'git init',
                    // if (grunt.option('projectrepo')
                    'git remote add -f origin ' + (grunt.option('projectrepo'))
                    // 'mkdir ' + grunt.option('project')
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
                    dest: ('deploy/' + grunt.option('project') + '/src/tmp/includes.json'),
                    cwd: ('deploy/' + grunt.option('project') + '/')
                }]
            },
        },
        // Deletes specified folders.
        clean: {
            deploys: ['deploy/'],
            deploy: ['deploy/' + grunt.option('project')],
            projects: ['workspaces/projects'],
            project: ['workspaces/projects/' + grunt.option('project')],
            visualizations: ['workspaces/visualizations/'],
            visualization: ['workspaces/visualizations/' + grunt.option('vis')]
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
                dest: ('deploy/' + grunt.option('project')),
            },
            //TODO: Change name
            framework2: {
                expand: true,
                cwd: 'workspaces/framework',
                src: ['**/*', '!lib/*', '!src/*', 'src/tmp/', 'src/DatasourceMap.js'],
                dest: 'workspaces/projects/' + grunt.option('project') + '/',
            },
            project: {
                expand: true,
                cwd: 'workspaces/projects/' + grunt.option('project') + '/',
                src: ['**/*'],
                dest: ('deploy/' + grunt.option('project')),
            },
            //Copies src files to dest (flattens directories)
            //TODO: Change name			
            flatten: {
                expand: true,
                cwd: 'workspaces/visualizations',
                src: ['**/*.js', '**/*.json', '!**/visincludes.json', '!**/*-config.js'],
                dest: ('deploy/' + grunt.option('project') + '/visuals'),
                flatten: true
            },
            //Copies templates and replaces placeholders with paramater values 
            vistemplate: {
                expand: true,
                // cwd: 'visualizations-workspace/' + grunt.option('vis') + '/' + grunt.option('vis'),
                src: ['templates/generatedVisContent/*'],
                dest: 'workspaces/projects/' + grunt.option('project') + '/visuals',
                rename: function(dest, srcPath) {
                    return dest + '/' + srcPath.replace(/\bVISALIAS\b/g, grunt.option('alias'));
                },
                options: {
                    process: function(content, srcpath) {
                        var cont = content;
                        cont = cont.replace(/\bVISALIASALT\b/g, grunt.option('alias')
                            .replace(/(?:^|\.?)([A-Z])/g, function(x, y) {
                                return "_" + y.toLowerCase();
                            }).replace(/^_/, ""));
                        cont = cont.replace(/\bVISALIAS\b/g, grunt.option('alias'));
                        cont = cont.replace(/\bVISNAME\b/g, grunt.option('vis'));
                        return cont;
                    },
                },
                flatten: true
            },
            //Runs copy tasks 
            watchcopyproject: {
                expand: true,
                dot: true,
                cwd: 'workspaces/projects/' + grunt.option('project'),
                src: ['**/*.*', '!.git/'],
                dest: 'deploy/' + grunt.option('project')
            },
            watchcopyvisualizations: {
                expand: true,
                dot: true,
                cwd: 'workspaces/visualizations/' + grunt.option('project'),
                src: ['**/*.*', '!.git/'],
                //TODO: This doesn't point to the correct location .Fix and test.
                dest: 'deploy/' + grunt.option('project') + '/visuals',
                flatten: true
            }
        },
        //Watches specified folders and run tasks when a file is changed.
        watch: {
            project: {
                files: ['**/*.*'],
                //Newer is a task that compares timestamps of two compared files and runs tasks if the compared file is
                tasks: ['newer:copy:watchcopyproject'],
                options: {
                    //nospawn is depricated but kept for compatibility.  use spawn false instead
                    spawn: false,
                    cwd: 'workspaces/projects/' + grunt.option('project'),
                    livereload: true
                },
            },
            visualizations: {
                files: ['**/*.*'],
                tasks: ['newer:copy:watchcopyvisualizations'],
                options: {
                    //nospawn is depricated but kept for compatibility.  use spawn false instead
                    spawn: false,
                    cwd: 'workspaces/visualizations/' + grunt.option('project'),
                },
            },
            main: {
                files: ['**/*.*'],
                options: {
                    cwd: 'deploy/' + grunt.option('project'),
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
                        grunt.option('project') = answers.projectinput

                        if (answers.dangerconfirm != false) {
                            grunt.task.run(answers.tasklist);
                        }
                    }
                }
            },
            visConfig02: {
                options: {
                    questions: [{
                        config: 'visConfig01',
                        type: 'checkbox',
                        message: 'Select all of the config options you would like or create a new config:',
                        choices: ['Circles', 'Rectangles', 'Edges', 'Labels', 'Table', 'Custom'],
                        validate: function(value) {
                            return true;
                        }, // return true if valid, error message if invalid. works only with type:input 
                        filter: function(value) {
                            return value;
                        },
                        when: function(answers) {
                            console.log(answers);
                            if (answers) {
                                return true;
                            }
                            return false;
                        }
                    }]
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
        availabletasks: {
            tasks: {}
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
        convertExcelToJson: {
            dist: {
                files: [{
                    src: 'SourceAndPrelims/' + grunt.option('src') + '.xlsx',
                    dst: 'output/' + grunt.option('src') + '.json',
                    isColOriented: false
                }]
            },
        },
        compress: {
            deploy: {
                options: {
                    archive: 'archive.zip'
                },
                files: [
                    {
                        src: ['deploy/' + grunt.option('project') + '/**'],
                        dest: ''
                    }
                ]
            }
        }
    }

    grunt.loadTasks('tasks');


    //Load all tasks in array
    ['grunt-contrib-compress', 'grunt-excel-as-json', 'grunt-jsdoc', 'grunt-peon-gui', 'grunt-shell', 'grunt-contrib-copy', 'grunt-contrib-clean', 'grunt-contrib-jshint', 'grunt-contrib-watch', 'grunt-jslint', 'grunt-jsbeautifier', 'grunt-folder-list', 'grunt-web-server', 'grunt-contrib-watch', 'grunt-newer', 'grunt-prompt', 'grunt-mkdir', 'grunt-available-tasks']
    .forEach(function(d) {
        grunt.loadNpmTasks(d);
    });
    // grunt.util._.extend(config, loadConfig('./tasks/lib/'));
    grunt.initConfig(config);



    // var visAttrs = {
    // 	radius: {
    // 		radius: [0,1]
    // 	},
    // 	width: {
    // 		width: [0,1]
    // 	},
    // 	height: {
    // 		height: [0,1]
    // 	},		
    // 	shapeStyle: {
    // 		fill: {
    // 			opacity: 1,
    // 			fill: "#000000"

    // 		},
    // 		stroke: {
    // 			strokeWidth: 0,
    // 			stroke: "#000000"
    // 		}
    // 	},
    // 	text: {
    // 		fontSize: [12,12],
    // 		format: {
    // 			pretty: 'Attr',
    // 			format: '' // currency | date | uppercase ...
    // 		}
    // 	},
    // 	table: {
    // 		attributes: [{
    // 			prettyLabel: 'Attr',
    // 			format: '' // currency | date | UPPERCASE ...
    // 		}],
    // 		pagination: 5,
    // 		globalSearch: false,
    // 		removeRow: false
    // 	}
    // }
    // var visConfig = {
    // 	nodes: {
    // 		radius: visAttrs.radius,
    // 		style: visAttrs.shapeStyle,
    // 		labels: visAttrs.text
    // 	}, 
    // 	bars: {
    // 		width: visAttrs.width,
    // 		height: visAttrs.height,
    // 		style: visAttrs.shapeStyle,
    // 		labels: visAttrs.text
    // 	},
    // 	labels: visAttrs.text,
    // 	edges: visAttrs.shapeStle,
    // 	table: visAttrs.table
    // }

    // grunt.registerTask('isgood', function() {

    // })



    grunt.registerTask('watch-proj', ['watch:project', 'watch:main']);
    grunt.registerTask('watch-vis', ['watch:visualizations']);
    grunt.registerTask('watch-proj-and-vis', ['watch-proj', 'watch-vis']);
    grunt.registerTask('build-project-files', ['shell:initproject']);
    grunt.registerTask('build-project-visualizations', function() {
        var obj = grunt.file.readJSON('workspaces/projects/' + grunt.option('project') + '/visuals/visincludes.json');
        grunt.config.data.shell.makeprojdir = {
            command: 'mkdir ' + grunt.option('project'),
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
                    'git remote add -f origin git@github.iu.edu:adhsimps/CNS-Framework-Plugins.git',
                    'git fetch origin ' + obj.data[d].commit || 'master',
                    'git reset --hard FETCH_HEAD'
                ].join('&&'),
                options: {
                    execOptions: {
                        stderr: false,
                        cwd: 'workspaces/visualizations/' + grunt.option('project')
                    }
                }
            }
            grunt.task.run(['shell:' + obj.data[d].visualization])
        });
    });
    grunt.registerTask('fetch-proj-files', ['clean:project', 'build-project-files']);
    grunt.registerTask('fetch-proj-visuals', ['clean:visualization', 'build-project-visualizations']);
    grunt.registerTask('build-framework', 'Clean the directory and copy the framework code to the deployment directory.', ['clean:deploy', 'copy:framework']);
    //TODO: Why does this no longer work?!
    grunt.registerTask('fetch-project', 'Fetch the project code from the remote repository, read the visIncludes.json file and fetch the corresponding visualizations. ' ['fetch-proj-files', 'fetch-proj-visuals']);
    grunt.registerTask('register-deploy-scripts', ['folder_list']);
    // grunt clean-workspace
    grunt.registerTask('clean-workspace', 'Cleans the workspace', ['clean:projects', 'clean:visualizations', 'clean:deploys', 'mkdir:workspace']);
    // grunt create-project --project=Project1 --projectrepo=C:\Users\simps_000\Desktop\CNS-Framework-Base\workspaces\projects\Project1
    grunt.registerTask('create-project', ['clean:project', 'shell:createproject', 'copy:framework2']);
    // grunt create-vis-config --project=Project1 --vis=SampleVis --alias=sampleVis01 
    grunt.registerTask('create-vis-config', ['copy:vistemplate']);
    // grunt build-project-full --project=Project1
    grunt.registerTask('build-project-full', ['build-framework', 'fetch-proj-files', 'fetch-proj-visuals', 'copy:project', 'copy:flatten', 'register-deploy-scripts']);
    // grunt build-project --project=Project1
    grunt.registerTask('build-project', ['copy:project', 'copy:flatten', 'register-deploy-scripts']);
    // grunt webserver
    grunt.registerTask('webserver', ['web_server', 'open:deploy']);
};
/*


grunt build-framework --project=i2b2
grunt fetch-proj-files --project=i2b2
grunt fetch-proj-visuals --project=i2b2
grunt copy:project --project=i2b2
grunt copy:flatten --project=i2b2
grunt register-deploy-scripts --project=i2b2

*/

// 
// + grunt.option('projectrepo')// git@github.iu.edu:adhsimps/CNS-Framework-Project-IAI-Phase2.git
