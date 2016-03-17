module.exports = {
  options: {
    browsers: ['last 2 version']
  },
  multiple_files: {
    expand: true,
    flatten: true,
    src: '<%= dirs.css %>build/*.css',
    dest: '<%= dirs.css %>build/prefixed/'
  }
}