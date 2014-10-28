module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    transport: {
      options: {
        debug: false
      },
      expand: {
        files: [{
          expand: true,
          cwd: 'js/lib/bird',
          src: ['base/*.js', 'mvvm/*.js'],
          dest: 'dest/bird'
        },{
          expand: true,
          cwd: 'demo',
          src: ['**/*.js'],
          dest: 'dest/demo'
        }]
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['dest/**/*.js'],
        dest: 'dest/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load custom task
  grunt.loadTasks('grunt');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-cmd-transport');
  // Default task(s).
  grunt.registerTask('default', ['transport', 'uglify', 'server']);
};