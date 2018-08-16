const path = require('path');

let pro_rootpath = process.cwd();

let cfg = {

    //  项目名称
    pro_name: '中铁表单插件',

    // 项目ctx路径
    pro_ctx: '',

    // 项目根路径: E:\\workspace\\Webstrom_workspace\\crccPlugin
    pro_rootpath: pro_rootpath,


    // 静态资源文件相对项目根目录，
    resource: {
        rootpath: 'web/static/'
    },

    // hbs视图相对项目根路径
    view: {
        rootpath: 'web/views/'
    },

    // 文件上传根目录
    upload: {
        // E:\\workspace\\Webstrom_workspace\\crccPlugin\\web\\_upload
        rootpath: path.resolve(pro_rootpath, "web/_upload")
    },

    // 文件下载根目录
    download: {
        // E:\\workspace\\Webstrom_workspace\\crccPlugin\\web\\_download
        rootpath: path.resolve(pro_rootpath, "web/_download")
    },
};

module.exports = cfg;