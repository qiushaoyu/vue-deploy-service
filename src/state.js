/**
 * 状态类
 * @type {{}}
 */
module.exports = {
    /**
     * 业务访问成功 状态码
     */
    SUCCESS: 200,
    /**
     * 登录用户名错误
     */
    LOGIN_ACCOUNT_ERROR: 301,
    /**
     * 登录密码错误
     */
    LOGIN_PASSWORD_ERROR: 302,
    /**
     * 安全码错误
     */
    SAFETY_CODE_ERROR: 303,
    /**
     * token失效
     */
    TOKEN_INVALID: 304,
    /**
     * token为空
     */
    TOKEN_NULL: 305,
    /**
     * 普通日志
     */
    LOG: 400,
    /**
     * 带状态日志  成功
     */
    LOG_SUCCESS: 401,
    /**
     * 带状态日志  警告
     */
    LOG_WARNING: 402,
    /**
     * 带状态日志 错误
     */
    LOG_ERROR: 403,
    /**
     * 业务错误
     */
    ERROR: 500,
    /**
     * 构建部署成功
     */
    DEPLOY_SUCCESS: 600,
    /**
     * 构建部署失败
     */
    DEPLOY_ERROR: 601,
    /**
     * 构建结束
     */
    DEPLOY_OVER: 100,
    /**
     * 项目未构建
     */
    PROJECT_STOP: 'STOP',
    /**
     * 项目构建中
     */
    PROJECT_ARCHIVE: 'ARCHIVE',
    /**
     * 项目构建错误
     */
    PROJECT_ERROR: 'ERROR',
};