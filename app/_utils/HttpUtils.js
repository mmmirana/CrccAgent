const qs = require('querystring');
const axios = require('axios');

let HttpUtils = {};

/**
 * GET请求获取数据
 * @param url
 * @param params
 * @returns {Promise<any>}
 */
HttpUtils.get = async function (url, params) {
    let paramStr = qs.stringify(params);
    let path = paramStr ? url + `?${paramStr}` : path;
    let result = await axios.get(path);
    return result.data;
};

HttpUtils.post = async function (url, params) {
    let result = await axios.post(url, params);
    return result.data;
};

module.exports = HttpUtils;