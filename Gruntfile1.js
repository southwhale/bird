var site = 'bird';

var config = {
    // QA 测试环境
    proxyTarget: '10.94.31.17',
    // 各位RD大神
    proxyTarget: '10.36.56.22', // sandbox
    proxyTarget: '10.94.25.105', // tangshen
    proxyTarget: '10.94.25.99', // bingwen
    // proxyTarget: '10.94.25.99',
    // proxyTargetPort: 8080
    proxyTargetPort: 8080,

    // 其他一些变量

    siteDir: 'dist',
    site: site

};

process.argv.forEach(function(val, index) {
    if (/^-(\w+):?(.*)?/.test(val)) {
        config[RegExp.$1] = RegExp.$2 === '' ? true : RegExp.$2;
    }
});

(function() {
    var SITE_PORT = parseInt(config.port || 9080, 10); // 端口起点
    var sitesPorts = {
        test: SITE_PORT - 1
    };
    sitesPorts[site] = SITE_PORT;
    config.sitesPorts = sitesPorts;
    config.baseDir = __dirname;
})();

module.exports = function(grunt) {
    var sitesPorts = config.sitesPorts;
    var fm = require('util').format;

    // Project configuration
    grunt.initConfig({
        qunit: {
            files: [fm('http://127.0.0.1:%s/runner.html', sitesPorts.test)]
        },
        watch: {
            _base: {
                files: ['Gruntfile.js', 'build.xml', 'asset/**', '!asset/img/**', '!asset/css/*.less'],
                tasks: ['build'],
                options: { spawn: false }
            },
            less: {
                files: 'asset/css/*.less',
                tasks: ['less:dev'],
                options: {
                    debounceDelay: 250
                }
            },
            bird: {
                files: [site + '/*', site + '/src/**', site + '/asset/**'],
                tasks: ['build:' + site],
                options: { spawn: false }
            }
        },
        less: {
            dev: {
                options: {
                    paths: [
                    ]
                },
                files: {
                    'asset/css/1.css': 'asset/css/1.less'
                }
            }
        },
        config: config
    });

    // 加载自定义task
    grunt.loadTasks('grunt');

    /**
     * 默认启动时的执行顺序
     *
     * $ grunt
     */
    grunt.registerTask('default', ['build', 'server', 'watch']);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-less');
};
