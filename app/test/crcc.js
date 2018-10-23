const axios = require('axios');
const fs = require('fs-extra');
const cookie = require('cookie');
const axiosReqCfg = require('./AxiosReqCfg_bk');
const BaiduAIUtils = require('../_utils/BaiduAIUtils');

axios.defaults.baseURL = axiosReqCfg.baseURL;
axios.defaults.headers = {
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36'
};

let index = 0;
let times = 5;
let loginCodeFile = 'E:\\workspace\\Webstrom_workspace\\CrccAgent\\app\\test\\_loginCode.png';

/**
 * crcc获取JSESSIONID
 */
async function getSessionID() {
    console.log(`正在获取sessionID`);
    let JSESSIONID = '';
    let res = await axios.get('http://aqgl.crcc.cn/login.do?reqCode=init');
    // 响应头
    let setCookieArr = res.headers['set-cookie'];
    if (setCookieArr && setCookieArr.length > 0) {
        let cookies = cookie.parse(setCookieArr[0]);
        JSESSIONID = cookies.JSESSIONID;
    }
    console.log(`获取sessionID: ${JSESSIONID}`);
    return JSESSIONID;
}


/**
 * 获取登录验证码
 */
async function getLoginValidateCode() {
    console.log(`获取验证码`);

    index++;
    if (index > times) {
        throw new Error(`当前${index}，超过识别次数：${times}`);
    }

    // 1、获取验证码字节流
    let resp = await axios({
        method: 'get',
        url: `system/admin/image.jsp?d=${Math.random()}`,
        responseType: 'stream'
    });

    // 2、写入文件
    resp.data.pipe(fs.createWriteStream(loginCodeFile));

    // 3、识别验证码
    let code = await BaiduAIUtils.recognize(loginCodeFile);

    if (validateCode(code)) {
        console.log(`获取验证码成功：${code}`);
        return code;
    } else {
        console.log(`第${index}次识别验证码错误：${code}`);
        return await getLoginValidateCode();
    }
}

/**
 * 登录
 * @param code
 * @return {Promise<void>}
 */
async function login(code) {
    let resp = await axios.post('login.do?reqCode=login', {
        'account': '142202199002184972',
        'password': '1234568Crcc',
        'verifycode': code,
        // 'loginuserid': '${userInfo.getUserid()}',

    });

    // setCookie("g4.login.account", account.getValue(), 240);
    // setCookie("g4.login.userid", resultArray.userid, 240);
    // setCookie("g4.lockflag", '0', 240);

    return resp.data;
}

/**
 * 验证单位是否可用
 * @return {Promise<void>}
 */
async function validateUnit() {
    let resp = await axios.post('safequality/troubledvr.do?reqCode=verificationUnitProejct', {
        fid: '30623',
        unitProjectid: '101081',
        ttype: '1',
        loginuserid: '10426838',
    });
    return resp.data;
}

/**
 * 注销
 * @return {Promise<void>}
 */
async function logout() {
    let resp = await axios.get('login.do?reqCode=logout');
    console.log(resp.data);
}


async function test() {

    // 1、获取sessionid
    let sessionID = await getSessionID();

    // 2、cookie 序列化，放入请求头
    let crccCookie = cookie.serialize("JSESSIONID", sessionID);
    axios.defaults.headers.Cookie = crccCookie;
    // axios.defaults.headers.Cookie = 'JSESSIONID=abc7kjE3BSVWjhJ0xIKyw; td_cookie=2557640942';

    // 3、获取验证码
    let code = await getLoginValidateCode();

    // 4、登录
    let loginResult = await login(code);

    return loginResult;
}

test()
    .then(function (resp) {
        console.log("test success");
        console.log(resp);
    })
    .catch(function (e) {
        console.log(e);
    });

/**
 * 校验验证码是否合法，不为空且长度只能为4
 * @param code
 * @return {number}
 */
function validateCode(code) {
    if (code && code.length === 4) return 1;
    return 0;
}