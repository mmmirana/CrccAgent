const path = require('path')
const Koa = require('koa')
const hbs = require('koa-hbs');
const convert = require('koa-convert');
const co = require('co');
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const koaBody = require('koa-body')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors');

// 项目配置信息
const appcfg = require('./app/_config/appcfg');
const appmiddleware = require('./app/_config/appmiddleware');

// error handler
onerror(app)

// 解决跨域问题
app.use(cors());

// koa2 文件上传配置，需要放在bodyParser之前，否则接收不到POST请求
app.use(koaBody({
    "formLimit": "5mb",
    "jsonLimit": "5mb",
    "textLimit": "5mb",
    multipart: true,
    formidable: {
        maxFileSize: 1024 * 1024 * 10  // 设置上传文件大小最大限制，默认 10M
    }
}));

// post请求解析
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))

// 放开所有的资源文件，包括下载的文件
app.use(require('koa-static')(path.resolve(__dirname)));

// 使用hbs模板引擎
app.use(convert(hbs.middleware({
    extname: '.hbs',// 文件扩展名
    defaultLayout: 'layout',// 默认的layout名称，默认layout
    viewPath: path.resolve(__dirname, appcfg.base_cfg.view.rootpath),// 视图根节点
    partialsPath: path.resolve(__dirname, appcfg.base_cfg.view.partialsPath),// 分区路径
    disableCache: true,// 禁止模板缓存。默认为false
})));
app.use(async (ctx, next) => {
    ctx.render_ = ctx.render;
    ctx.render = function (tpl, locals) {
        return co.call(ctx, ctx.render_(tpl, locals));
    }
    await next();
})

app.use(json())
app.use(logger())

// logger
app.use(async (ctx, next) => {

    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// app中间件
app.use(appmiddleware.fn);

// 初始化路由映射
const routeloader = require('./app/_config/routeloader');
routeloader.init(app);

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app
