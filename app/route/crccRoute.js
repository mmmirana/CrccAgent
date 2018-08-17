const router = require('koa-router')();
const koaBody = require('koa-body');

router.prefix('/crcc');

/**
 * 到达crcc首页
 */
router
    .get('/', async function (ctx, next) {
        await ctx.redirect('/crcc/index');
    })
    // 使用默认layout
    .get('/layout', async function (ctx, next) {
        await ctx.render('crcc/index', {title: 'crccTest'});
    })
    // 使用其他layout
    .get('/layout2', async function (ctx, next) {
        await ctx.render('crcc/index', {layout: 'layout2', title: 'crccTest2'})
    })
    // 登录请求get
    .get('/login', async function (ctx, next) {
        ctx.body = 'get login';
    })
    // 登录请求post
    .post('/login', function (ctx, next) {
        console.log('invoke crcc/login');
        ctx.body = 'post login';
    });


module.exports = router
