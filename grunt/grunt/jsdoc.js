module.exports = function(grunt) {
    return {
        dist: {
            src: [grunt.dirs.workspacesframework + '**/*.js', '!' + grunt.dirs.workspacesvisualizations + '**/lib/'],
            options: {
                destination: grunt.dirs.deploy + 'doc',
                // template : 'node_modules/ink-docstrap/template',
                // configure : 'node_modules/ink-docstrap/template/jsdoc.conf.json'
            }
        },
        grunt: {
            src: ['Gruntfile.js'],
            options: {
                destination: grunt.dirs.deploy + 'grunt-doc',
                // template : 'node_modules/ink-docstrap/template',
                // configure : 'node_modules/ink-docstrap/template/jsdoc.conf.json'
            }
        }
    }
}
