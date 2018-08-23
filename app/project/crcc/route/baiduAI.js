const router = require('koa-router')();

router.prefix('/baiduAI');

router.get('/', async (ctx, next) => {
    await ctx.render('crcc/baiduAI')
});

router.get('/index', async (ctx, next) => {
    await ctx.render('crcc/baiduAI')
});


module.exports = router;