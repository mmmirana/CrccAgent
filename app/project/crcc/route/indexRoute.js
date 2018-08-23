const router = require('koa-router')()

router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Hello Koa 2!'
    })
})

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json'
    }
})

/**
 * 渲染hbs
 */
router.get('/hbs', async (ctx, next) => {
    await ctx.render('index', {
        title: 'hbs test'
    })
})

module.exports = router
