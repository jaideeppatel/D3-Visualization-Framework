module.exports = {
  dist: {
    options: {
      // cssmin will minify later
      style: 'expanded'
    },
    files: {
      '<%= dirs.css %>build/global.css': '<%= dirs.css %>global.scss'
    }
  }
}