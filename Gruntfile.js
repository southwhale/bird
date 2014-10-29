module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    transport: {
      options: {
        debug: false,
        except: ['js/lib/bird/base/bird.oo.js']/*,
        alias: {  
          'jquery': '/bird/js/lib/jquery/jquery-1.11.1',
          'bootstrap': '/bird/component/bootstrap/js/bootstrap.amd',
          'icheck': '/bird/component/icheck/icheck.amd',
          'moment': '/bird/js/lib/moment/moment',
          'q': '/bird/js/lib/q/q',
          'bird.ui': '/bird/js/lib/bird/ui/bird.ui' 
        }*/
      },
      expand: {
        files: [{
          expand: true,
          cwd: 'js/lib/bird/base',
          src: ['*.js'],
          dest: 'dest/bird/base'
        },{
          expand: true,
          cwd: 'js/lib/bird/mvvm',
          src: ['*.js'],
          dest: 'dest/bird/mvvm'
        },{
          expand: true,
          cwd: 'demo',
          src: ['**/*.js'],
          dest: 'dest/demo'
        },{
          src: ['demo.js'],
          dest: 'dest/demo'
        }]
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      bird: {
        files: [{
          src: ['dest/**/*.js'],
          dest: 'dest/<%= pkg.name %>.min.js'
        }, {
          src: ['demo/modConfig.js'],
          dest: 'dest/moduleConfig.min.js'
        }]
      }
    }
  });

  // Load custom task
  grunt.loadTasks('grunt');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-contrib-connect');
  // Default task(s).
  grunt.registerTask('default', ['transport', 'uglify', 'server']);
};