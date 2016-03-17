//Copies src directory to dest
module.exports = function(grunt) {
	config.copy = {
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
			dest: 'workspaces/projects/' + grunt.option('project') + '/',
		},
		project: {
			expand: true,
			cwd: 'workspaces/projects/' + grunt.option('project') + '/',
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
			dest: 'deploy',
			flatten: true
		}
	}
}