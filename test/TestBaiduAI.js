const AipOcrClient = require("baidu-aip-sdk").ocr;
const HttpClient = require("baidu-aip-sdk").HttpClient;
const fs = require('fs');

function test() {
    let APP_ID = "11699790";
    let API_KEY = "wcIwFIGZcg8N4TRz6Zp3Qavi";
    let SECRET_KEY = "tLs4kFEBOEvDqCAlkkbl4fxQPhEpcOTK";
    let client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

    // 设置request库的一些参数，例如代理服务地址，超时时间等
    // request参数请参考 https://github.com/request/request#requestoptions-callback
    HttpClient.setRequestOptions({timeout: 5000});

    // 也可以设置拦截每次请求（设置拦截后，调用的setRequestOptions设置的参数将不生效）,
    // 可以按需修改request参数（无论是否修改，必须返回函数调用参数）
    // request参数请参考 https://github.com/request/request#requestoptions-callback
    HttpClient.setRequestInterceptor(function (requestOptions) {
        // 查看参数
        console.log(requestOptions)
        // 返回参数
        return requestOptions;
    });

    let image = fs.readFileSync("image.jpg").toString("base64");

    // 调用通用文字识别, 图片参数为本地图片
    client.generalBasic(image).then(function (result) {
        // console.log(JSON.stringify(result));
        console.log(result.words_result[0].words.replace(/\s/, ""));
    }).catch(function (err) {
        // 如果发生网络错误
        console.log(err);
    });
}

test();

