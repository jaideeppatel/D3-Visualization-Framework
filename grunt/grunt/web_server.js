/**
 * @memberOf gruntconfig
 * @type {Object}
 * @description {@link https://www.npmjs.com/package/grunt-web-server NPM Documentation}
 */
module.exports = function(grunt) {
    return {
        options: {
            cors: true,
            port: 8000,
            nevercache: true,
            logRequests: true,
            base: grunt.dirs.deploy
        },
        foo: 'bar' // For some reason an extra key with a non-object value is necessary 
    }
}
