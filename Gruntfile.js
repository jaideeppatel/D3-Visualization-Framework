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
					// 'git remote add -f origin git://github.com/Simpsoah/Project-Test.git',
					// 'git fetch origin ' + (grunt.option('commit') || 'master'),
					// 'git reset --hard FETCH_HEAD'
					'mkdir ' + grunt.option('project'),
					'cd ' + grunt.option('project'),
					'git init',
					'git config core.sparseCheckout true',
					'echo ' + grunt.option('project') + '/*>> .git/info/sparse-checkout',
					'git remote add -f origin git://github.com/Simpsoah/Project-Test.git',
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
					'mkdir ' + grunt.option('project'),
					'cd ' + grunt.option('project'),
					'git init',
					'git remote add -f origin git://github.com/Simpsoah/Project-Test.git',
					'mkdir ' + grunt.option('project')
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
			framework: {
				expand: true,
				cwd: 'workspaces/framework',
				src: ['**/*'],
				dest: ('deploy/' + grunt.option('project')),
			},
			framework2: {
				expand: true,
				cwd: 'workspaces/framework',
				src: ['**/*', '!lib/*', '!src/*', 'src/tmp/', 'src/DatasourceMap.js'],
				dest: 'workspaces/projects/' + grunt.option('project') + '/' + grunt.option('project') + '/',
			},
			project: {
				expand: true,
				cwd: 'workspaces/projects' + grunt.option('project') + '/' + grunt.option('project'),
				src: ['**/*'],
				dest: ('deploy/' + grunt.option('project')),
			},
			//Copies src files to dest (flattens directories)
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
				dest: 'workspaces/projects/' + grunt.option('project') + '/' + grunt.option('project') + '/visuals',
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
				dest: 'deploy'
			},
			watchcopyvisualizations: {
				expand: true,
				dot: true,
				cwd: 'workspaces/visualizations/' + grunt.option('project'),
				src: ['**/*.*', '!.git/'],
				dest: 'deploy',
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
						//TODO: Why do I need this? What is reporter?
						config: 'tasklist',
						type: 'list', // list, checkbox, confirm, input, password
						message: 'What would you like to do?',
						choices: [{
							value: 'create-project',
							name: 'Setup a new project'
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
						console.log("asdf")
						console.log(grunt.config)
							grunt.option('project') = answers.projectinput

						if (answers.dangerconfirm != false) {
							grunt.task.run(answers.tasklist);
						}
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
		availabletasks: {
			tasks: {}
		}
	}

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jslint');
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks('grunt-folder-list');
	grunt.loadNpmTasks('grunt-web-server');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-prompt');
	grunt.loadNpmTasks('grunt-mkdir');
	grunt.loadNpmTasks('grunt-available-tasks');
	// grunt.util._.extend(config, loadConfig('./tasks/lib/'));
	grunt.initConfig(config);
	console.log(grunt.option('project'))
	grunt.registerTask('watchproj', ['watch:project', 'watch:main']);
	grunt.registerTask('watchvis', ['watch:visualizations']);
	grunt.registerTask('watchboth', ['watchproj', 'watchvis']);
	grunt.registerTask('build-project-files', ['shell:initproject']);
	grunt.registerTask('build-project-visualizations', function() {
		var obj = grunt.file.readJSON('workspaces/projects/' + grunt.option('project') + '/' + grunt.option('project') + '/visuals/visincludes.json');
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
		Object.keys(obj.data).forEach(function(d, i) {
			grunt.config.data.shell[obj.data[d].visualization] = {
				command: [
					'mkdir ' + obj.data[d].visualization,
					'cd ' + obj.data[d].visualization,
					'git init',
					'git config core.sparseCheckout true',
					'echo ' + obj.data[d].visualization + '/*>> .git/info/sparse-checkout',
					'git remote add -f origin git://github.com/Simpsoah/Visualizations-Test.git',
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
	grunt.registerTask('fetch-project', 'Fetch the project code from the remote repository, read the visIncludes.json file and fetch the corresponding visualizations. ' ['fetch-proj-files', 'fetch-proj-visuals']);
	grunt.registerTask('register-deploy-scripts', ['folder_list']);
	// grunt clean-workspace
	grunt.registerTask('clean-workspace', 'Cleans the damn workspace', ['clean:projects', 'clean:visualizations', 'clean:deploys', 'mkdir:workspace']);
	// grunt create-project --project=Project1
	grunt.registerTask('create-project', ['clean:project', 'shell:createproject', 'copy:framework2']);
	// grunt create-vis-config --project=Project1 --vis=SampleVis --alias=sampleVis01 
	grunt.registerTask('create-vis-config', ['copy:vistemplate']);
	// grunt build-project-full --project=Project1
	grunt.registerTask('build-project-full', ['build-framework', 'fetch-project', 'copy:project', 'copy:flatten', 'register-deploy-scripts']);
	// grunt build-project --project=Project1
	grunt.registerTask('build-project', ['copy:project', 'copy:flatten', 'register-deploy-scripts']);
	// grunt webserver
	grunt.registerTask('webserver', ['web_server']);
};