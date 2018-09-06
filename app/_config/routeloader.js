/**
 * 路由加载器，负责加载appcfg中指定的路由文件
 */
const path = require('path');
const glob = require('glob');
const appcfg = require('./appcfg');

let routeloader = {};

routeloader.init = function (app) {
    // 同步获取所有的root文件
    let routFiles = glob.sync(appcfg.base_cfg.router.filepattern);

    console.log('routFiles', routFiles);

    routFiles.forEach(function (routeFile) {
        console.log('正在解析路由', routeFile);
        let routeItem = require(path.relative(__dirname, routeFile));
        app.use(routeItem.routes(), routeItem.allowedMethods());
    });
}

module.exports = routeloader;