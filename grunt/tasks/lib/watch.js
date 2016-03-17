//Watches specified folders and run tasks when a file is changed.
module.exports = function(grunt) {
	return {
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
	}
}