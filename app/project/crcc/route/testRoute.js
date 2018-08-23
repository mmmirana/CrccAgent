const BaseRouter = require('../../_base/BaseRouter');

let router = new BaseRouter('/test');

router
    .get('/testString', function (ctx) {
        let username = ctx.parameters.username;
        return {'username': username};
    })
    .get('/testJson', function (ctx) {
        let username = ctx.parameters.username;
        return {'username': username};
    })
    .get('/testHtml', function (ctx) {
        let username = ctx.parameters.username;
        let tpl = 'index';
        let tpldata = {'username': username};
        return {tpl, tpldata};
    })

module.exports = router.getRouter();