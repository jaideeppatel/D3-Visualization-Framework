module.exports = {
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
}