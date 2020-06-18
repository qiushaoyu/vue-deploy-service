const gulp = require('gulp');
const scp = require('gulp-scp2');
const ssh = require('gulp-ssh');
const zip = require('gulp-zip');
const fs = require('fs');
const minimist = require('minimist');
const gulpSequence = require('gulp-sequence');
const moment = require('moment');


const remotePath = "/data/web"; // 生产zip资源路径
const remotePathTest = "/data/web/test";  //test zip资源路径
const remotePathBeta = "/data/web/test";  //beta zip资源路径
const remotePathDev = "/data/web/dev";  //dev zip资源路径
const resourcesName = "resources"; //zip资源文件夹名称
let fileName = ""; // 需要发布的文件名
let rasPth = "/data/node/service-key/id_rsa";  //私钥路径
let production_rasPth = "/data/node/service-key/xk_key";  //生产私钥路径
let projectPath = "";
let fullName = "";
const sshConfig = {
    dev: {
        host: '192.168.*.*',
        username: 'root',
        password: '123',
        dest: remotePathDev,
        port: '22'
    },
    test: {
        host: '192.168.*.*',
        username: 'root',
        password: '123',
        dest: remotePathTest,
        port: '22'
    },
    beta: {
        host: '47.103.*.*',
        username: 'root',
        dest: remotePathBeta,
        privateKey: fs.readFileSync(production_rasPth),
        port: '8711'
    },
    production: {
        host: '47.99.*.*',
        username: 'root',
        privateKey: fs.readFileSync(production_rasPth),
        dest: remotePath,
        port: '9822'
    }
}

const knownOptions = [
    {
        string: 'env',
        default: {env: 'dev', project: ""}
    }
];
const options = minimist(process.argv.slice(2), knownOptions);
let service = null;

gulp.task('deploy', () => {
    service = sshConfig[options.env];
    fileName = options.pro;
    projectPath = `/data/node/project/${options.full}/`;
    if (!fileName) {
        console.log("Error 找不到指定项目");
        return
    }
    fullName = `${fileName}${moment().format('YYYYMMDDHHmmss')}.zip`; // zip文件全称
    if (service) {
        gulpSequence('zip', 'resources', 'shell', function () {

        });
    } else {
        console.error('Error 发布失败！！！，未指定资源服务器')
    }
})


gulp.task('zip', () => {
    let zipStream = gulp.src(`${projectPath}dist/**/*`)
        .pipe(zip(fullName))
        .pipe(gulp.dest(`${projectPath}dist_zip`))
        .on('error', (err) => {
            console.log('Error 资源压缩ZIP失败', err)
        })
    return zipStream
})

gulp.task('resources', ['zip'], () => {
    service.destination = service.dest;
    service.dest = `${service.dest}/${resourcesName}/${fileName}`;
    let upStream = gulp.src(`${projectPath}dist_zip/${fullName}`)
        .pipe(scp({
            ...service,
            watch: function (client) {
                client.on('write', function (o) {
                    console.log('write %s', o.destination);
                });
            }
        }))
        .on('error', (err) => {
            console.log('Error 资源上传失败', err);
        });
    return upStream
})

gulp.task('shell', () => {
    const gulpSSH = new ssh({
        ignoreErrors: false,
        sshConfig: service
    })
    const commands = [`cd ${service.destination}/${fileName} && rm -rf ./* && cd ${service.dest} && unzip -o -d ${service.destination}/${fileName} ${fullName} && chmod 755 -R ${service.destination}/${fileName}/*`];
    gulpSSH.shell(commands)
})