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
          cwd: 'output/lib/<%= pkg.name %>/base',
          src: [
            '*.js', '!bird.oo.js'
          ],
          dest: 'output/lib/<%= pkg.name %>/base'
        },{
          expand: true,
          cwd: 'output/lib/<%= pkg.name %>/mvvm',
          src: ['*.js'],
          dest: 'output/lib/<%= pkg.name %>/mvvm'
        },{
          expand: true,
          cwd: 'output/demo',
          src: ['**/*.js', '!moduleConfig.js', '!moduleConfig.release.js'],
          dest: 'output/demo'
        }]
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      bird: {
        files: [{
          src: ['output/lib/bird/base/*.js', 'output/lib/bird/mvvm/*.js', 'output/demo/**/*.js'],
          dest: 'output/<%= pkg.name %>.min.js'
        }/*, {
          src: ['demo/modConfig.js'],
          dest: 'dest/moduleConfig.min.js'
        }*/]
      }
    },
    copy: {
      homepage: {
        src: 'demo.html',
        dest: 'output/demo.html',
        options: {
          process: function (content, srcpath) {
            content = content.replace("./js/lib/seajs/sea-debug.js","lib/seajs/sea-debug.js");
            content = content.replace("!--script","script");
            content = content.replace("script--","script");
            //content = content.replace("./demo/entry","entry");
            return content;
          }
        }
      },
      app: {
        src: 'demo.js',
        dest: 'output/demo.js'
      },
      asset: {
        files: [
          // makes all src relative to cwd
          {
            expand: true, 
            cwd: 'demo/', 
            src: ['**'], 
            dest: 'output/demo'
          }
        ]
      },
      moduleConfig: {
        src: 'demo/moduleConfig.js',
        dest: 'output/demo/moduleConfig.js',
        options: {
          process: function (content, srcpath) {
            content = content.replace(/\/\/begin/g, '/*//begin');
            content = content.replace(/\/\/end/g, '//end*/');
            content = content.replace('base: modprefix + \'js/\'', 'base: modprefix');
            return content;
          }
        }
      },
      thirdLib: {
        files: [
          // makes all src relative to cwd
          {
            expand: true, 
            cwd: 'js/lib/', 
            src: ['**'], 
            dest: 'output/lib'
          },
          {
            expand: true, 
            cwd: 'component/', 
            src: ['**'], 
            dest: 'output/component'
          },
          {
            expand: true, 
            cwd: 'css/', 
            src: ['**'], 
            dest: 'output/css'
          },
          {
            expand: true, 
            cwd: 'fonticon/', 
            src: ['**'], 
            dest: 'output/fonticon'
          }
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: 'output',
          keepalive: true,
          hostname: "127.0.0.1"
        }
      }
    }
  });

  // Load custom task
  //grunt.loadTasks('grunt');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-contrib-connect');
  // Default task(s).
  grunt.registerTask('default', ['copy', 'transport', 'uglify', 'connect']);
};