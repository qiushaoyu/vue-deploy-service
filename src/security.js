const STATE = require('./state');
const REQUEST = require('request');

let securityCode = "";

/**
 * 初始化账户
 * @type {Map<any, any>}
 */
const userMap = new Map();
userMap.set('admin_dev', '123456');
userMap.set('admin_test', '123456');
userMap.set('admin_beta', 'beta_123');
userMap.set('admin_production', 'production_deploy');

/**
 * token MAP
 * @type {Map<any, any>}
 */
const tokenMap = new Map();

/**
 * 清理过期token
 */
function clearExpiredToken(verifi = false, token = "") {
    let temp = Date.parse(new Date());
    if (verifi) {
        let obj = tokenMap.get(token) ? JSON.parse(tokenMap.get(token)) : '';
        if (!obj) {
            return {
                code: STATE.TOKEN_NULL,
                message: 'token验证失败'
            }
        } else if (temp >= obj.endTime) {
            return {
                code: STATE.TOKEN_INVALID,
                message: 'token已过期'
            }
        } else {
            return {
                code: STATE.SUCCESS
            }
        }
    }
    tokenMap.forEach(function (value, key, map) {
        let obj = JSON.parse(map.get(key));
        if (temp >= obj.endTime) {
            tokenMap.delete(key)
        }
    })
}

{
    setInterval(function () {
        clearExpiredToken()
    }, 1000 * 60)
}

/**
 * http请求
 * @param content
 */
function httpRequest(content) {
    REQUEST({
        url: "https://oapi.dingtalk.com/robot/send?access_token=40836c625cde50f682544f50a39ea283fd10ed36237a23546ccac68c83633fe7",
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(content)
    }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
            console.log(body) // 请求成功的处理逻辑
        } else {
            console.log(err)
        }
    })
}

/**
 * 生产安全码
 */
function generateSecurityCode(len = 6) {
    let num = "";
    for (let i = 0; i < len; i++) {
        num += Math.floor(Math.random() * 10);
    }
    console.log("安全码", num);
    securityCode = num;
    httpRequest({
        "msgtype": "text",
        "text": {
            "content": `安全码：${securityCode}`
        }
    })
}

{
    //初始化安全码
    generateSecurityCode();
    /**
     * 定时更新安全码
     */
    setInterval(function () {
        generateSecurityCode();
    }, 1000 * 60 * 5)
}


/**
 * 获取uuid
 * @returns {string}
 */
function getUUid() {
    let s = [];
    let hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

    s[8] = s[13] = s[18] = s[23] = "-";

    let uuid = s.join("");
    return uuid;
}

let security = {
    /**
     * login验证
     * @param account
     * @param password
     * @param securityOrder
     * @param env
     */
    login(account, password, securityOrder, env) {
        return new Promise((resolve, reject) => {
            if (!userMap.get(account + '_' + env)) {
                reject({
                    code: STATE.LOGIN_ACCOUNT_ERROR,
                    message: "用户名错误"
                });
                return
            }
            if (password !== userMap.get(account + '_' + env)) {
                reject({
                    code: STATE.LOGIN_PASSWORD_ERROR,
                    message: "密码错误"
                });
                return
            }
            if (securityOrder !== securityCode) {
                reject({
                    code: STATE.SAFETY_CODE_ERROR,
                    message: "验证码错误"
                });
                return
            }
            let token = getUUid();
            tokenMap.set(token, JSON.stringify({
                account,
                password,
                endTime: Date.parse(new Date()) + (1000 * 60 * 15)
            }));
            resolve({
                code: STATE.SUCCESS,
                data: {
                    token
                }
            })
        })
    },
    /**
     * 验证token
     */
    verificationToken(token) {
        return clearExpiredToken(true, token)
    }
};

module.exports = security;