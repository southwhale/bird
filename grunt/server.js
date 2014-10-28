module.exports = function(grunt) {

    var express = require('express');
    var path = require('path');
    var fs = require('fs');
    var http = require('http');
    var chalk = require('chalk');

    grunt.registerTask('server', 'Starting web servers', function() {

        var site = 'bird';
        var baseDir = __dirname;

        var done = this.async();
        // 独立运行server task进程不退出
        // grunt server:on

        var isMock = true;

        //single server
        var server = {
            port: 6666,
            root: path.join(baseDir, '..'),
            dataRoot: path.join(baseDir, site, 'data')
        };
        var app = express();
        app.use(require('serve-favicon')(__dirname + '/public/favicon.ico'));
        app.use(require('morgan')('dev'));

        if (isMock) {
            app.use(require('body-parser').json());
        }
        else {
            // 请求的body部分存起来，转发的时候要带上
            app.use(function(req, resp, next) {
                var bodyBuffer = [];

                req.on(
                    'data',
                    function(chunk) {
                        bodyBuffer.push(chunk);
                    }
                );

                req.on(
                    'end',
                    function() {
                        if(bodyBuffer.length > 0) {
                            req.bodyBuffer = Buffer.concat(bodyBuffer);
                        }
                        next();
                    }
                );
            });
        }
        app.use(express.static(server.root));
        if (!isMock) {
            function mockProxy(req, res, next) {
                proxy(
                    "192.168.2.110",
                    80,
                    {
                        request: req,
                        response: res
                    }
                );
            }
            app.all('*.json', mockProxy);
            app.all('/user/account.html', mockProxy);
            app.all('/logout.html', mockProxy);
        }
        else {

            app.all('/data*', function(req, res, next) {
                res.sendfile(server.dataRoot + req.params[0]);
            });

            var dlList = [
                { action: '/user/listLogExport.json' },
                { action: '/user/traceDetectExport.json' },
                { action: '/admin/listLogExport.json' },
                { action: '/user/getLbsListExport.json' },
                { action: '/user/getReportListExport.json' },
                { action: '/user/getReportListExportEMS.json' },
                { action: '/user/customReport.json' },
                { action: '/admin/getExportExpense.json' },
                { action: '/admin/exportKeyword.json' },
                { action: '/user/appDataReportExport.json' }
            ];
            var DOWNLOAD_PATH = baseDir + '/asset/tmp/download-debug.csv';
            dlList.forEach(function(route) {
                app.get(route.action, function(req, res, next) {
                    res.download(DOWNLOAD_PATH);
                });
            });
            app.all(/getLocation\.json/i, function(req, res) {
                res.send(
                    JSON.stringify({
                        model: {
                            isFc: true,
                            claimUrl: "http://www.baidu.com",
                            packageName: "p.a.c.k.a.g.e",
                            versionId: "4",
                            smallLogoUrl: "asset/img/baidu.gif",
                            appSize: "36970169",
                            supportOs: "IOS ANDROID",
                            versionName: "4.0",
                            appName: "后台返回的程序解析的名字",
                            ipaInstallUrl: "http://ipaUrl.com",
                            file: path.join('asset/', 'shabi')
                        }
                    })
                );
            });

            app.all(/\/user\/uploadFileBat.json/ig, function(req, res) {
                res.send(
                    JSON.stringify({
                        success: true,
                        model: {
                            file: "xxxxxxx",
                            upload: "/path/to/file/468x60.jpg",
                            width: 468,
                            height: 60,
                            device: 2,
                            fileName: '468x60.jpg'
                        }
                    })
                );
            });
            app.all(/\.json/i, function(req, res, next) {
                var url = req.url;
                // 无视上传
                if (url.indexOf('uploadFile') > -1 || (url.indexOf('getLocation') > -1)) {
                    next();
                    return;
                }
                res.sendfile(server.dataRoot + req.url.replace(/\.json.*/, '.js'));
            });
        }
        // 有些东西总是mock的
        var list = [
            {
                action: '/group/add'
            },
            {
                action: '/user/uploadFile.json',
                names: [
                    // 以下是ma
                    'picUpload', 'logo', 'merchantLogo', 'wallAppLogo',
                    'upload', 'mapLogo', 'video',
                    'ZipUpload', 'wbDeliverPicurl', 'imageCpm', 'infostreamLogo',
                    {
                        name: 'picUpload', suffix: [
                            '11', '12', '21', '22', '23',
                            '24', '25', '13', '14', '15'
                        ]
                    },
                    {
                        name: 'ZipUploads', suffix: ['11', '12']
                    }
                ]
            },
            {
                action: '/user/getLocation.json',
                name: 'lbsUpload'
            }
        ];
        list.forEach(function(list) {
            app.post(list.action, function(req, res) {
                console.log(req);
                var uploadArr = [req.files[list.name || 'upload']];
                if (!uploadArr[0]) {
                    var names = list.names;
                    var index = -1;
                    list.names.forEach(function(obj) {
                        if (typeof obj === 'string') {
                            uploadArr[++index] = req.files['upload_' + obj];
                        }
                        else {
                            var prefix = 'upload_' + obj.name;
                            obj.suffix.forEach(function(suffix) {
                                var str = prefix + '_' + suffix;
                                if (suffix === '') str = prefix;
                                uploadArr[++index] = req.files[str];
                            });
                        }
                    });
                }
                uploadArr.forEach(function(upload) {
                    if (!upload) return;
                    var fName = '' + new Date().getTime() + '-' + upload.name;
                    var newPath = path.join(server.root, "/asset/", fName);
                    fs.readFile(upload.path, function(err, data) {
                        fs.writeFile(newPath, data, function(err) {
                            console.error('upload failed', err);
                        });
                    });
                    res.set('Content-Type', 'text/html');
                    var arrLoc = [
                        {
                            location: '上海市徐汇区漕溪北路398号',
                            mechant: '上海投融'
                        },
                        {
                            location: 'abcde',
                            mechant: 'abcde'
                        },
                        {
                            location: '上海市静安区淮安路717号',
                            mechant: '上海师惠经济园区'
                        },
                        {
                            location: 'zxcv',
                            mechant: 'zxcv'
                        }
                    ];
                    res.send(
                        JSON.stringify({
                            model: {
                                /*locations: {
                                 message: '部分商户地址不完整；',
                                 locationList: arrLoc
                                 },*/
                                isFc: true,
                                claimUrl: "http://www.baidu.com",
                                packageName: "p.a.c.k.a.g.e",
                                versionId: "4",
                                smallLogoUrl: "asset/img/baidu.gif",
                                appSize: "36970169",
                                supportOs: "IOS ANDROID",
                                versionName: "4.0",
                                appName: "后台返回的程序解析的名字",
                                ipaInstallUrl: "http://ipaUrl.com",
                                file: path.join('asset/', fName),
                                // for addUnit apk上传
                                appKey: "key-mock",
                                appChannel: "channel-mock",
                                appInfo: "您上传的应用已成功安装百度移动统计SDK，AppKEY为mockid"
                                //sessionTimeout: true
                                //formError: { a: 'a', b: 'b' },
                                //showDetail: "http://hi.baidu.com/mobads/item/fbea921a8c202026b831802d"
                            }
                        })
                    );
                });
            });
        });


        app.listen(server.port, function() {
            console.log('server [%s], [http://127.0.0.1:%s], root [%s]',
                site, server.port, server.root);
        });

        // test server
        /*(function(site) {
            var server = {
                port: config.sitesPorts[site], root: path.join(baseDir, site)
            };
            var app = express();
            //app.use(express.logger('dev'));
            //app.use(express.compress());
            app.use(express.static(server.root));
            app.use(require('body-parser'));
            app.all('/base/*', function(req, res, next) {
                res.sendfile(req.params[0]);
            });
            app.post('/group/detail.json', function(req, res) {
                console.log(req.body);
                res.send({
                    "success": false, //成功
                    "model": {
                        "formError": {
                            "f1": "error1"
                        }
                    }
                });
            });
            app.listen(server.port, function() {
                console.log('server [%s], [http://127.0.0.1:%s], root [%s]',
                    site, server.port, server.root);
                // qunit依赖服务器启动ready
                config.live !== 'on' && done(true);
            });
        })('test');*/
    });
};

function proxy(hostname, port, context) {

    var request = context.request;

    // build request options
    var targetHost = hostname + ( port ? ':' + port : '' );
    var reqHeaders = request.headers;

    var reqOptions = {
        hostname   : hostname,
        port       : port || 80,
        method     : request.method,
        path       : request.url,
        headers    : reqHeaders
    };

    // create request object
    var start = Date.now();
    var req = http.request( reqOptions, function ( res ) {
        var output = res;
        if( res.headers['content-encoding'] == 'gzip' ) {
            var gzip = require('zlib').createGunzip();
            res.pipe(gzip);
            output = gzip;
        }
        var content = [];
        output.on('data', function(chunk) {
            content.push(chunk);
        } );

        output.on('end', function() {
            console.log(chalk.yellow('PROXY') + ' %s to %s - - %s ms', chalk.green(request.url),
                    chalk.green(targetHost + request.url), Date.now() - start);
            var buffer = Buffer.concat(content);

            var response = context.response;
            response.set(res.headers);
            response.set('Access-Control-Allow-Origin', '*');
            response.send(res.statusCode, buffer);
        });
    });

    req.on('error', function (err) {
        console.log( chalk.yellow( 'PROXY' ) + ' %s to %s - - %s ms', chalk.green(request.url),
                chalk.green(targetHost + request.url), Date.now() - start );
        var response = context.response;
        response.send(500, '');
    });

    req.setTimeout(30000, function() { this.socket.destroy(); })

    // send request data
    var buffer = request.bodyBuffer;
    if (buffer) {
        req.write( buffer );
    }

    req.end();
};
