/**
 * 根目录下的Gruntfile.js用来构建bird框架，生成合并压缩后的lib和ui放入dep目录下，具体的业务模块依赖于dep下的文件而不依赖src目录下的文件
 * 业务模块的构建逻辑则在build目录下，两者不要混淆了
 * 该构建文件未把第三方库合并压缩到bird.js和bird.min.js中，而是在需要时通过require动态引入，若需要一起合并压缩，可修改相应的任务
 * 执行构建命令需加上参数： --force , 即：grunt --force
 */
module.exports = function(grunt) {

  // bird configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    transport: {
      options: {
        debug: false
      },
      bird: {
        files: [{
          expand: true,
          cwd: 'src/lib/<%= pkg.name %>/base/',
          src: [
            '*.js', '!bird.oo.js'
          ],
          dest: 'dep/lib/<%= pkg.name %>/base'
        },{
          expand: true,
          cwd: 'src/lib/<%= pkg.name %>/mvvm/',
          src: ['*.js'],
          dest: 'dep/lib/<%= pkg.name %>/mvvm'
        },{
          expand: true,
          cwd: 'src/lib/<%= pkg.name %>/tool/',
          src: ['errorTrack.js'],
          dest: 'dep/lib/<%= pkg.name %>/tool'
        }]
      },
    },
    concat: {
      options: {
        banner: '/**\n * @file: <%= pkg.name %>.js\n * @author: <%= pkg.author %>\n * @version: <%= pkg.version %>\n * @date: <%= grunt.template.today("yyyy-mm-dd") %>\n */\n',
        separator: '\n'
      },
      bird: {
        src: ['dep/lib/<%= pkg.name %>/**/*.js', '!dep/lib/<%= pkg.name %>/tool/tracker.js'],
        dest: 'dep/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*@file:<%= pkg.name %>.min.js @author:<%= pkg.author %> @version:<%= pkg.version %> @date:<%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      bird: {
        files: [{
          src: ['dep/<%= pkg.name %>.js'],
          dest: 'dep/<%= pkg.name %>.min.js'
        }]
      }
    },
    copy: {
      thirdLib: {
        files: [
          //ui
          {
            expand: true, 
            cwd: 'src/ui/', 
            src: ['**'], 
            dest: 'dep/ui'
          },
          //3rd lib
          {
            expand: true, 
            cwd: 'src/lib/', 
            src: ['**','!bird/'], 
            dest: 'dep/lib'
          }
        ]
      },
      bird: {
        files: [
          {
            expand: true,
            cwd: 'src/lib/<%= pkg.name %>/tool/',
            src: ['tracker.js'],
            dest: 'dep/lib/<%= pkg.name %>/tool'
          }
        ]
      }
    }
  });

  // Load custom task
  //grunt.loadTasks('grunt');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-cmd-transport');
  
  // Default task(s).
  grunt.registerTask('default', ['copy', 'transport', 'concat', 'uglify']);
};