module.exports = {
  options: {
    livereload: true,
  },
  scripts: {
    files: ['<%= dirs.js %>*.js'],
    tasks: ['jshint', 'concat', 'uglify'],
    options: {
      spawn: false,
    }
  },
  css: {
    files: ['<%= dirs.css %>*.scss'],
    tasks: ['sass', 'autoprefixer', 'cssmin'],
    options: {
      spawn: false,
    }
  },
  images: {
    files: ['<%= dirs.images %>**/*.{png,jpg,gif}', '<%= dirs.images %>*.{png,jpg,gif}'],
    tasks: ['imagemin'],
    options: {
      spawn: false,
    }
  },
  html:{
    files: ['<%= dirs.html %>**/*.html'],
    tasks: [],
    options: {
      spawn: false
    }
  }
}