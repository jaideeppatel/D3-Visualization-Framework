//Lists all .js, .json, and .css files in the project deployment directory. 
//Writes the files to a JSON object so Head.js can load them. 
module.exports = function(grunt) {
	return {
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
		}
	}
}