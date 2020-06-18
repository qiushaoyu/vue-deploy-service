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
        projectName: "xk-web-share",
        git: 'http://192.168.2.201/xk-web/xk-web-share.git',
        ...publicProp
    },
    user: {
        fileName: 'web',
        path: "/data/node/project/xk-web-user-up",
        projectName: "xk-web-user-up",
        git: 'http://192.168.2.201/xk-web/xk-web-user-up.git',
        ...publicProp
    },
    coin: {
        fileName: 'coin',
        path: "/data/node/project/xk-wechat-coin",
        projectName: "xk-wechat-coin",
        git: 'http://192.168.2.201/xk-web/xk-wechat-coin.git',
        ...publicProp
    },
    profit: {
        fileName: 'profit',
        path: "/data/node/project/xk-profit-html",
        projectName: "xk-profit-html",
        git: 'http://192.168.2.201/xk-web/xk-profit-html.git',
        ...publicProp
    },
    system: {
        fileName: 'system',
        path: "/data/node/project/xk-system-html",
        projectName: "xk-system-html",
        git: 'http://192.168.2.201/xk-manage/xk-system-html.git',
        ...publicProp
    },
    merchant: {
        fileName: 'shweb',
        path: "/data/node/project/xk-merchant-html",
        projectName: "xk-merchant-html",
        git: 'http://192.168.2.201/xk-manage/xk-merchant-html.git',
        process: {
            dev: {
                env: 'develop',
                pid: "",
                status: STATE.PROJECT_STOP
            },
            test: {
                env: 'testing',
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
    },
    rider: {
        fileName: 'rider',
        path: "/data/node/project/xk-rider-html",
        projectName: "xk-rider-html",
        git: 'http://192.168.2.201/xk-manage/xk-rider-html.git',
        ...publicProp
    },
    music: {
        fileName: 'music',
        path: "/data/node/project/xk-live-music",
        projectName: "xk-live-music",
        git: 'http://192.168.2.201/xk-live/xk-live-music.git',
        ...publicProp
    },
    activity: {
        fileName: 'activity',
        path: "/data/node/project/xk-web-activity",
        projectName: "xk-web-activity",
        git: 'http://192.168.2.201/xk-web/xk-web-activity.git',
        ...publicProp
    },
    live: {
        fileName: 'live',
        path: "/data/node/project/xk-live-html",
        projectName: "xk-live-html",
        git: 'http://192.168.2.201/xk-live/xk-live-html.git',
        ...publicProp
    },
    manage: {
        fileName: 'manage',
        path: "/data/node/project/xk-manage-html",
        projectName: "xk-manage-html",
        git: 'http://192.168.2.201/xk-manage/xk-manage-html.git',
        ...publicProp
    },
    game: {
        fileName: 'game',
        path: "/data/node/project/xk-wechat-game",
        projectName: "xk-wechat-game",
        git: 'http://192.168.2.201/xk-web/xk-wechat-game.git',
        ...publicProp
    }
};