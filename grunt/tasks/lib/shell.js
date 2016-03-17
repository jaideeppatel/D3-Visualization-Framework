module.exports = function(grunt) {
	return {
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
				'mkdir ' + grunt.option('project'),
				'cd ' + grunt.option('project'),
				'git init',
				'git remote add -f origin ' + grunt.option('projectrepo'),
				// 'mkdir ' + grunt.option('project')
			].join('&&')
		}
	}
}