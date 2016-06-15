/**
 * @memberOf gruntconfig
 * @type {Object}
 * @description {@link https://www.npmjs.com/package/grunt-contrib-connect NPM Documentation}
 */
module.exports = function(grunt) {
    return {
        server: {
            options: {
                port: 8000,
                hostname: 'localhost',
                base: 'deploy',
        
                livereload: true,
                middleware: function(connect, options, middlewares) {
                    // inject a custom middleware into the array of default middlewares
                    // this is likely the easiest way for other grunt plugins to
                    // extend the behavior of grunt-contrib-connect
                    middlewares.push(function(req, res, next) {
                        req.setHeader('Access-Control-Allow-Origin', '*');
                        req.setHeader('Access-Control-Allow-Methods', '*');
                        return next();
                    });
                    return middlewares;
                }
            }
        }
    }
}
