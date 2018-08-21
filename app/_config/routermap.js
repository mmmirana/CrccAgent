const index = require('../route/indexRoute');
const users = require('../route/usersRoute');
const crcc = require('../route/crccRoute');
const common = require('../route/commonRoute');
const baiduAI = require('../route/baiduAI');

let routerMap = {};

routerMap.init = function (app) {
    // routes
    app.use(index.routes(), index.allowedMethods());
    // app.use(users.routes(), users.allowedMethods());
    app.use(crcc.routes(), crcc.allowedMethods());
    app.use(common.routes(), common.allowedMethods());
    app.use(baiduAI.routes(), baiduAI.allowedMethods());
}

module.exports = routerMap;