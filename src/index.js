const project = require('./project')
const services = require('./service')

const io = require('socket.io')(8078);

console.log("server start");
io.on("connection", function (socket) {
    console.log("client connection");

    socket.on("login", function (res = {account: "", password: "", securityOrder: "", env: ""}, callback) {
        services.login(res.account, res.password, res.securityOrder, res.env)
            .then(res => {
                callback(res)
            })
            .catch(err => {
                callback(err)
            })
    });

    socket.on("restart", function (res = {project: "", env: "", projectFull: "", token: ""}) {
        services.structure(socket, res);
    });

    socket.on("endKillProcess", function (res, callback,) {
        services.endProcess(project[res.key].process[res.env].pid, socket, res, callback);
        services.execEnd(socket, res);
    });
    //断开连接会发送
    socket.on("disconnect", function () {
        console.log("client disconnect")
    })
});