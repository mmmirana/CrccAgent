const appRoot = require('app-root-path');

// 项目根路径
let pro_rootpath_abs = appRoot.path;

let cfg = {

    // 项目名称
    pro_name: '中铁表单插件',
    // 项目ctx路径 默认''
    pro_ctx: '',
    // 项目端口号
    pro_port: 3100,

    base_cfg: {
        // 项目根路径: E:\\workspace\\Webstrom_workspace\\crccPlugin
        pro_rootpath_abs: pro_rootpath_abs,// 绝对路径
        pro_rootpath_rel: './',// 相对路径
        // 静态资源文件相对项目根目录，
        resource: {
            rootpath: 'web/static/',
        },
        // hbs视图相对项目根路径
        view: {
            rootpath: 'web/views/',
            partialsPath: 'web/views/partials/',
        },
        // 文件上传根目录
        upload_rootpath: "web/_upload",
        // 文件下载根目录
        download_rootpath: "web/_download",
        // 缓存文件目录
        temp_rootpath: "web/_temp",

        // 路由文件所在目录
        router: {
            filepattern: 'app/project/**/route*/*.js',
        },
        job: {
            filepattern: 'app/project/job/**/job_*.js',
        }
    },

    baidu: {
        // 百度AI应用的参数
        AI_APPLICATION: {
            APP_ID: "11699790",
            API_KEY: "wcIwFIGZcg8N4TRz6Zp3Qavi",
            SECRET_KEY: "tLs4kFEBOEvDqCAlkkbl4fxQPhEpcOTK",
        }
    },

    tencent: {
        // 百度AI应用的参数
        AI_APPLICATION: {
            APP_ID: "2108504173",
            API_KEY: "YFo1ojZYVY6585eA",
            SECRET_KEY: "tLs4kFEBOEvDqCAlkkbl4fxQPhEpcOTK",
        }
    },

    mysql: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '1234',
        database: 'db_crcc',
    },

    mysql_cfg: {
        pk_name: 'sid',// 主键id字段名
    }
};

module.exports = cfg;