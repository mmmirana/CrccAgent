const appcfg = require('./appcfg');
const IPUtils = require('../_utils/IPUtils');

let appmiddleware = {};

appmiddleware.fn = async function (ctx, next) {

    await attachParameters(ctx);

    await logIPAddr(ctx);

    await next();
}

/**
 * ctx, request params
 */
async function attachParameters(ctx) {
    // 声明全局变量
    ctx.state = Object.assign(ctx.state, {ctx: appcfg.pro_ctx});

    // 将get和post的参数都放入ctx.parameters中
    let parameters = {};
    parameters = Object.assign(parameters, ctx.request.query);
    parameters = Object.assign(parameters, ctx.request.body);
    ctx.parameters = parameters;
}

/**
 * 打印ip
 * @param ctx
 * @returns {Promise<void>}
 */
async function logIPAddr(ctx) {
    // 获取客户端的ip地址
    let ipAddr = await IPUtils.getClientIP(ctx.req);
    console.log(ipAddr);

    // 获取客户端ip信息
    // let ipinfo = await IPUtils.getIPinfo(ctx.req);
    // console.log(JSON.stringify(ipinfo));
}

module.exports = appmiddleware;