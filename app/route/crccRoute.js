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
    .get('/index', async function (ctx, next) {
        await ctx.render('crcc/index', {title: 'crccTest'});
    })
    .get('/login', async function (ctx, next) {
        ctx.body = 'get login';
    })
    .post('/login', function (ctx, next) {
        console.log('invoke crcc/login');
        ctx.body = 'post login';
    });


module.exports = router
