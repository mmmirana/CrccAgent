const router = require('koa-router')();
const appcfg = require('../../_config/appcfg');
const ResultUtils = require('../../_utils/ResultUtils');


/**
 * 路由基类
 */
class BaseRouter {

    constructor(preffix) {

        if (!preffix)
            preffix = '/' + appcfg.pro_ctx;
        else
            preffix = '/' + appcfg.pro_ctx + "/" + preffix;
        // 将多个左斜杠'/'或者右斜杠'\'转为单个'/'
        preffix = preffix.replace(/(\\+|\/+)/g, '/');

        // 指定当前路由前缀
        router.prefix(preffix);
    }

    /**
     * 映射get请求
     * @param path 请求的路径
     * @param fn 解析请求的函数
     * @returns {BaseRouter}
     */
    get(path, fn) {
        router.get(path, async function (ctx, next) {
            await resolveReq(ctx, next, fn);
        });
        return this;
    }

    post(path, fn) {
        router.post(path, fn);
        return this;
    }

    put(path, fn) {
        router.put(path, fn);
        return this;
    }

    del(path, fn) {
        router.del(path, fn);
        return this;
    }

    all(path, fn) {
        router.all(path, function (ctx, next) {
            ctx.render();
        });
        return this;
    }

    getRouter() {
        return router;
    }
}

/**
 * 解析请求
 * @param ctx context上下文
 * @param next next
 * @param fn 解析请求的函数，返回值为response的返回值
 */
async function resolveReq(ctx, next, fn) {
    // 返回值
    let result = await fn(ctx, next) || "";
    if (result.tpl) {
        // 解析到页面
        return ctx.render(result.tpl, result.tpldata);
    } else {
        ctx.body = result;
    }
}

module.exports = BaseRouter;