const HttpUtils = require('./HttpUtils');
let IPUtils = {};

/**
 * 获取客户端ip
 * @param req
 * @returns {*|string|string}
 */
IPUtils.getClientIP = function (req) {
    // 经过nginx反向代理服务器，请设置'X-Real-IP'的属性，
    let ip = req.headers['X-Real-IP'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress || '';

    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip;
};


/**
 * 获取客户端ip信息
 * @param req
 * @returns {Promise<object>}
 */
IPUtils.getIPinfo = async function (req) {
    let ip = this.getClientIP(req);
    if (ip) {
        let ipinfo = await HttpUtils.get('http://ip.taobao.com/service/getIpInfo.php', {ip: ip});
        return ipinfo;
    } else {
        return '';
    }
}

module.exports = IPUtils;