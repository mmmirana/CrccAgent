const router = require('koa-router')();

router.prefix('/crcc');

router.get('/', async function (ctx, next) {
    ctx.body = 'crcc index';
})


module.exports = router;