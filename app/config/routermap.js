const index = require('../route/indexRoute');
const users = require('../route/usersRoute');
const crcc = require('../route/crccRoute');

let routerMap = {};

routerMap.init = function (app) {
    // routes
    app.use(index.routes(), index.allowedMethods());
    app.use(users.routes(), users.allowedMethods());
    app.use(crcc.routes(), crcc.allowedMethods());
}

module.exports = routerMap;