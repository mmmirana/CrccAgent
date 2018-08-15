const router = require('koa-router')()

router.prefix('/crcc')

router.get('/', function (ctx, next) {
    ctx.render('index', {title: 'crccTest'});
})

router.get('/x', function (ctx, next) {
    ctx.render('index.hbs', {title: 'crccTest'});
})

module.exports = router
