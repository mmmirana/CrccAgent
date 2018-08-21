const fs = require('fs');
const AipOcrClient = require("baidu-aip-sdk").ocr;
const HttpClient = require("baidu-aip-sdk").HttpClient;
const appcfg = require('../_config/appcfg');
const ImageUtils = require('./ImageUtils');

let BaiduAIUtils = {};

/**
 * 获取client
 * @returns {*}
 */
BaiduAIUtils.getAipOcrClient = function () {
    let APP_ID = appcfg.baidu.AI_APPLICATION.APP_ID;
    let API_KEY = appcfg.baidu.AI_APPLICATION.API_KEY;
    let SECRET_KEY = appcfg.baidu.AI_APPLICATION.SECRET_KEY;
    let client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
    HttpClient.setRequestOptions({timeout: 5000});
    // HttpClient.setRequestInterceptor(function (requestOptions) {
    //     // 查看参数
    //     console.log(requestOptions)
    //     // 返回参数
    //     return requestOptions;
    // });
    return client;
};

/**
 * 调用通用文字识别, 图片参数为本地图片
 * @param imagepath
 * @returns {Promise<any>}
 */
BaiduAIUtils.generalBasic = function (imagepath) {
    return new Promise(async function (resolve, reject) {
        let client = BaiduAIUtils.getAipOcrClient();
        let toImgPath = await ImageUtils.processImg(imagepath);
        let image = fs.readFileSync(toImgPath).toString("base64");
        client.generalBasic(image).then(function (result) {
            // console.log(result.words_result[0].words.replace(/\s/, ""));// 去掉所有空格
            // console.log(JSON.stringify(result));
            resolve(result.words_result);
        }).catch(function (err) {
            // 如果发生网络错误
            reject(err);
        });
    })
};

/**
 * 识别所有文字到一行
 * @param imagepath
 * @returns {Promise<string>}
 */
BaiduAIUtils.recognize = async function (imagepath) {
    let resutText = '';
    let result = await this.generalBasic(imagepath);
    for (let i = 0; i < result.length; i++) {
        let wordItem = result[i];
        resutText += wordItem.words || "";
    }
    return resutText.replace(/\s/, '');
}

module.exports = BaiduAIUtils;