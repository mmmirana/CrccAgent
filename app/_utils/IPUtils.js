const HttpUtils = require('./HttpUtils');
let IPUtils = {};

/**
 * 获取客户端ip
 * @param req
 * @returns {*|string|string}
 */
IPUtils.getClientIP = function (req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip;
};

/**
 * 获取客户端ip信息
 * @param req
 * @returns {Promise<any>}
 */
IPUtils.getIPinfo = async function (req) {
    let ipinfo = await HttpUtils.get('http://ip.taobao.com/service/getIpInfo.php', {ip: this.getClientIP(req)});
    return ipinfo;
}

module.exports = IPUtils;