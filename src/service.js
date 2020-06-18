const project = require('./project');
const STATE = require('./state');
const security = require('./security');

const process = require('child_process');

/**
 * 自定义广播事件
 * @type {{PROJECTCHANGESTATUS: string}}
 */
const BROADCAST = {
    PROJECTCHANGESTATUS: "projectChangeStatus"  //项目构建状态改变
};

/**
 * 节流 n秒内只会执行一次 重复点击不会重新计算时间
 * @param fn
 * @param time
 * @returns {Function}
 */
function throttle(fn, time) {
    let canRun = true;
    return function (...args) {
        return new Promise((resolve, reject) => {
            if (!canRun) return;
            canRun = false;
            setTimeout(() => {
                fn(...args).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                });
                canRun = true;
            }, time);
        })
    };
}


let services = {

    /**
     * socket登录
     * @param account
     * @param password
     * @param securityOrder
     * @param env
     */
    login: throttle(function (account, password, securityOrder, env) {
        return new Promise((resolve, reject) => {
            security.login(account, password, securityOrder, env)
                .then(result => {
                    if (result.code === STATE.SUCCESS) {
                        console.log("登录成功");
                        result.data.project = project;
                        resolve(JSON.stringify(result))
                    }
                })
                .catch((err = {code: STATE.ERROR, message: "登录失败"}) => {
                    console.log("登录验证失败");
                    reject(err)
                })
        })
    }, 2000),
    /**
     * 输出日志
     * @param socket
     * @param state
     * @param content
     */
    outputLog(socket, project, state, content) {
        let str = content.split(/[\n]/);
        for (let item of str) {
            socket.emit("pushProjectLog", {
                key: project.key,
                env: project.env,
                log: item,
                status: state
            });
        }
    },
    /**
     * 构建结束
     * @param socket
     * @param res
     * @param code
     */
    execEnd(socket, res, code = STATE.DEPLOY_OVER) {
        project[res.key].process[res.env].status = STATE.PROJECT_STOP; //构建结束
        services.broadcastEvent(socket, BROADCAST.PROJECTCHANGESTATUS, {...res, status: STATE.PROJECT_STOP});
        services.outputLog(socket, res, code, '构建结束');
    },
    /**
     * 结束指定进程
     * @param pid
     * @param socket
     * @param res
     * @param callback
     */
    async endProcess(pid, socket, res, callback = function () {
    }) {
        let verifi = await security.verificationToken(res.token);
        if (verifi.code !== STATE.SUCCESS) {
            return services.outputLog(socket, res, verifi.code, verifi.message)
        }
        let endProcess = process.exec(`sudo kill -9 ${pid}`, (stdout, stderr, error) => {
            if (error) {
                console.log(`结束进程${pid}错误`, error)
                services.outputLog(socket, res, STATE.LOG_ERROR, error);
            } else {
                services.outputLog(socket, res, STATE.LOG_SUCCESS, `node ${pid} 进程已结束`);
                callback(res)
            }
        });
    },
    /**
     * 日志类型区分
     * @param data
     * @param res
     * @param socket
     * @param pid
     */
    sortingLOG(data, res, socket, pid) {
        try {
            if (typeof data === 'string') {
                //特殊日志处理
                if (data.indexOf('This relative module was not found') >= 0 || data.indexOf('Module not found: Error') >= 0) {
                    services.outputLog(socket, res, STATE.LOG_ERROR, "process callback" + data);
                    services.endProcess(pid, socket, res);
                    services.execEnd(socket, res);
                    return
                }
                let str = data.substring(0, 30);
                if (str.indexOf("success") >= 0 || str.indexOf("SUCCESS") >= 0) {
                    services.outputLog(socket, res, STATE.LOG_SUCCESS, data);
                } else if (str.indexOf("warning") >= 0 || str.indexOf("WARN") >= 0) {
                    services.outputLog(socket, res, STATE.LOG_WARNING, "process callback" + data)
                } else if (str.indexOf("error") >= 0 || str.indexOf("ERROR") >= 0 || str.indexOf("ERR") >= 0 ||
                    str.indexOf("Error") >= 0 || str.indexOf("Err") >= 0) {
                    services.outputLog(socket, res, STATE.LOG_ERROR, "process callback" + data);
                    services.endProcess(pid, socket, res);
                    services.execEnd(socket, res);
                } else {
                    services.outputLog(socket, res, STATE.LOG, data);
                }
            }
        } catch (e) {
            console.log("javascript语法错误", e);
            services.outputLog(socket, res, STATE.ERROR, "javascript语法错误：" + e);
            services.endProcess(pid, socket, res);
            services.execEnd(socket, res)
        }
    },
    /**
     * 开始构建
     * @param socket
     * @param res
     * @param callback
     */
    structure(socket, res, callback) {
        try {
            let verifi = security.verificationToken(res.token);
            if (verifi.code !== STATE.SUCCESS) {
                return services.outputLog(socket, res, verifi.code, verifi.message)
            }
            console.log(res);
            if (!res.key) services.outputLog(socket, res, STATE.ERROR, '请指定需要构建的项目');
            if (!res.env) services.outputLog(socket, res, STATE.ERROR, '请指定项目的构建环境');
            if (!project[res.key].path) services.outputLog(socket, res, STATE.ERROR, '指定项目不存在');
            if (!project[res.key].process) services.outputLog(socket, res, STATE.ERROR, '指定构建环境不存在');
            if (project[res.key].process[res.env].status !== STATE.PROJECT_STOP) services.outputLog(socket, res, STATE.ERROR, '指定项目上一次构建还未结束')
            project[res.key].process[res.env].status = STATE.PROJECT_ARCHIVE; //构建中
            services.broadcastEvent(socket, BROADCAST.PROJECTCHANGESTATUS, {...res, status: STATE.PROJECT_ARCHIVE});
            let shell = `#!/bin/bash
                if [ ! -d '/data/node/project/${project[res.key].projectName}' ]; then
                    cd /data/node/project/
                    echo "WARN 正在克隆${project[res.key].projectName}"
                    git clone ${project[res.key].git}
                    cd /data/node/node-server/
                fi
                chmod 755 -R ${project[res.key].path} && cd ${project[res.key].path}
                echo 'SUCCESS 开始构建${project[res.key].projectName}'
                git reset --hard
                echo 'SUCCESS 检测Git分支'
                branch=$(git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3)
                if [ $branch != ${project[res.key].process[res.env].env} ] 
                then 
                    localBranch=$(git branch | grep ${project[res.key].process[res.env].env})
                    if [ -n "$localBranch" ]; then
                        git checkout ${project[res.key].process[res.env].env}
                        echo "SUCCESS 切换到分支${project[res.key].process[res.env].env}"
                    else
                        originBranch=$(git branch -a | grep ${project[res.key].process[res.env].env})
                        if [ -n "$originBranch" ]; then
                            git checkout -b ${project[res.key].process[res.env].env} origin/${project[res.key].process[res.env].env}
                            echo "SUCCESS 切换到新分支${project[res.key].process[res.env].env}"
                        else
                            git fetch
                            echo "Error 未检测到远程分支${project[res.key].process[res.env].env}"
                        fi
                    fi
                fi
                echo 'SUCCESS 拉取${project[res.key].projectName} ${project[res.key].process[res.env].env}分支代码'
                git pull origin ${project[res.key].process[res.env].env}
                echo 'SUCCESS 拉取node_module依赖'
                yarn
                echo 'SUCCESS 拉取node_module依赖完成 开始打包BUILD'
                yarn build
                echo 'SUCCESS BUILD完成 开始上传'
                cd /data/node/node-server
                gulp deploy --env ${res.env} --pro ${project[res.key].fileName} --full ${project[res.key].projectName}
                echo 'SUCCESS ${project[res.key].projectName}部署成功'`;
            let workerProcess = process.exec(shell, (error) => {
                if (error !== null) {
                    console.log('exec error' + error);
                    if (typeof error === 'string') {
                        services.sortingLOG(error, res, socket, workerProcess.pid)
                    }
                } else {
                    //构建成功
                    services.execEnd(socket, res, STATE.SUCCESS);
                }
            });

            project[res.key].process[res.env].pid = workerProcess.pid; //构建中
            workerProcess.stdout.on('data', (data) => {
                console.log("stdout", data);
                if (typeof data === 'string') {
                    services.sortingLOG(data, res, socket, workerProcess.pid)
                } else {
                    console.log("--------------------------------------", typeof data);
                    console.log("**************************************", data)
                }
            });
            workerProcess.stderr.on('data', (data) => {
                console.log("stderr", data);
                if (typeof data === 'string') {
                    services.sortingLOG(data, res, socket, workerProcess.pid)
                }
            });
            /*workerProcess.on('exit', (code) => {
                console.log('子进程已退出，退出码 ' + code);
                services.outputLog(socket,res,STATE.LOG_ERROR,"子进程已退出，退出码 " + code);
                services.execEnd(socket, res);
            })*/
        } catch (e) {
            console.log("javascript语法错误Error:", e);
            services.outputLog(socket, res, STATE.ERROR, "javascript语法错误：" + e);
            services.execEnd(socket, res)
        }
    },
    /**
     * 自定义广播事件
     */
    broadcastEvent(socket, event, param) {
        socket.emit('broadcast', event, param)
    }
};

module.exports = services;