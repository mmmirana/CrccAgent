const router = require('koa-router')()

router.prefix('/crcc')

/**
 * 到达crcc首页
 */
router.get('/', async function (ctx, next) {
    await ctx.redirect('crcc/index');
});
router.get('/index', async function (ctx, next) {
    await ctx.render('crcc/index', {title: 'crccTest'});
});

module.exports = router
