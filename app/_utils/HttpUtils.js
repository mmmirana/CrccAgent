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
    try {
        let paramStr = qs.stringify(params);
        let path = paramStr ? url + `?${paramStr}` : url;
        let result = await axios.get(path);
        return result.data;
    } catch (e) {
        throw e;
    }
};

/**
 * Post请求获取数据
 * @param url
 * @param params
 * @return {Promise<*>}
 */
HttpUtils.post = async function (url, params) {
    try {
        let result = await axios.post(url, params);
        return result.data;
    } catch (e) {
        throw e;
    }
};


module.exports = HttpUtils;
