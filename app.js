const path = require('path')
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const koaBody = require('koa-body')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

/**
 * 项目配置信息
 * @type {{project_rootpath, resource, hbs, upload, download}}
 */
const appcfg = require('./app/_config/appcfg');
/**
 * 路由映射
 * @type {{}}
 */
const routermap = require('./app/_config/routermap');

// error handler
onerror(app)


/**
 * koa2 文件上传配置，需要放在bodyParser之前，否则接收不到POST请求
 * @type {((options?: koaBody.IKoaBodyOptions) => Koa.Middleware) | koaBody}
 */
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 1024 * 1024 * 10  // 设置上传文件大小最大限制，默认 10M
    }
}));

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))

app.use(json())
app.use(logger())

// app.use(require('koa-static')(path.resolve(__dirname, appcfg.resource.rootpath)));
app.use(require('koa-static')(path.resolve(__dirname)));

app.use(views(path.resolve(__dirname, appcfg.view.rootpath), {
    extension: 'hbs',
    map: {hbs: 'handlebars'}
}));

// logger
app.use(async (ctx, next) => {

    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// ctx, request params
app.use(async (ctx, next) => {
    // 声明全局变量
    ctx.state = Object.assign(ctx.state, {ctx: appcfg.pro_ctx});

    await next();
})

// 初始化路由
routermap.init(app);

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app
