const router = require('koa-router')();

router.prefix('/crcc');

/**
 * 到达crcc首页
 */
router
    .get('/', async function (ctx, next) {
        await ctx.redirect('/crcc/index');
    })
    // 使用默认layout
    .get('/index', async function (ctx, next) {
        await ctx.render('crcc/index', {title: 'crccIndex'});
    })
    // 使用默认layout
    .get('/layout', async function (ctx, next) {
        await ctx.render('crcc/index', {title: 'layout'});
    })
    // 使用其他layout
    .get('/layout2', async function (ctx, next) {
        await ctx.render('crcc/index', {layout: 'layout2', title: 'layout2'})
    })
    // 登录请求get
    .get('/login', async function (ctx, next) {
        await ctx.render('crcc/login')
    })
    // 登录请求post
    .post('/login', async function (ctx, next) {
        console.log('invoke crcc/login');

        console.log('login,params', ctx.parameters);

        await ctx.redirect('/crcc/index');
    });


module.exports = router
