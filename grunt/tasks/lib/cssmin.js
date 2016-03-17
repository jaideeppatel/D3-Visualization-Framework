module.exports = {
  combine: {
    files: {
      '<%= dirs.css %>build/minified/global.css': ['<%= dirs.css %>build/prefixed/global.css']
    }
  }
}