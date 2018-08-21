/**
 * 公用路由
 */

const path = require('path');
const router = require('koa-router')();
const sendfile = require('koa-sendfile');// 文件下载

const appcfg = require('../_config/appcfg');
const fileutils = require('../_utils/FileUtils');

router.prefix('/common');

/**
 * 文件上传，post
 */
router.post('/upload', async (ctx, next) => {
    // 上传单个文件
    const xfile = ctx.request.files.xfile; // 获取上传文件
    const midpath = ctx.request.body.midpath || "";// 中间路径，类似于模块名

    if (!xfile) {
        return ctx.body = "找不到name='xfile'的文件！";
    } else {
        // 上传单个文件
        try {
            let filepath = fileutils.upload(xfile, midpath);
            return ctx.body = "上传成功！" + `filepath: ${filepath}`;
        } catch (e) {
            return ctx.body = "上传失败！";
        }
    }
});

/**
 * 文件下载，get
 */
router.get('/download', async function downloadFile(ctx, next) {

    let midpath = ctx.query.midpath || "";// 中间路径，类似于模块名
    let filename = ctx.query.filename;// 文件名称
    let filepath = path.resolve(appcfg.base_cfg.upload.rootpath, midpath, filename);// 文件服务器路径

    if (fileutils.existFile(filepath)) {
        ctx.attachment(decodeURI(filepath));
        await sendfile(ctx, filepath);

    } else {
        ctx.body = '抱歉，文件不存在或路径有误！';
    }
});


module.exports = router;
