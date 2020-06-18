const STATE = require('./state');

let publicProp = {
    log: [],
    process: {
        dev: {
            env: 'dev',
            pid: "",
            status: STATE.PROJECT_STOP
        },
        test: {
            env: 'test',
            pid: "",
            status: STATE.PROJECT_STOP  //stop 停止  //archive 构建中
        },
        beta: {
            env: 'beta',
            pid: "",
            status: STATE.PROJECT_STOP  //stop 停止  //archive 构建中
        },
        production: {
            env: 'master',
            pid: "",
            status: STATE.PROJECT_STOP  //stop 停止  //archive 构建中
        }
    }
};
module.exports = {
    share: {
        fileName: 'share',
        path: "/data/node/project/xk-web-share",
        projectName: "web-share",
        git: 'gitPath',
        ...publicProp
    },
    user: {
        fileName: 'web',
        path: "/data/node/project/xk-web-user-up",
        projectName: "web-user-up",
        git: 'gitPath',
        ...publicProp
    },
    coin: {
        fileName: 'coin',
        path: "/data/node/project/xk-wechat-coin",
        projectName: "wechat-coin",
        git: 'gitPath',
        ...publicProp
    },
    profit: {
        fileName: 'profit',
        path: "/data/node/project/xk-profit-html",
        projectName: "profit-html",
        git: 'gitPath',
        ...publicProp
    },
    system: {
        fileName: 'system',
        path: "/data/node/project/xk-system-html",
        projectName: "system-html",
        git: 'gitPath',
        ...publicProp
    },
};