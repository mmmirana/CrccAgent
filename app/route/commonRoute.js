/**
 * 公用路由
 */

const path = require('path');
const router = require('koa-router')();

const appcfg = require('../_config/appcfg');
const fileutils = require('../_utils/FileUtils');

router.prefix('/common');

/**
 * 文件上传
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
            fileutils.upload(xfile, midpath);
            return ctx.body = "上传成功！";
        } catch (e) {
            return ctx.body = "上传失败！";
        }
    }
});

/**
 * 文件下载，get和post均可
 */
router.get('/download', async function downloadFile(ctx, next) {

    let midpath = ctx.params.midpath || "";// 中间路径，类似于模块名
    let filename = ctx.params.filename;// 文件名称
    let filepath = path.resolve(appcfg.upload.rootpath, midpath, filename);// 文件服务器路径

    if (fileutils.existFile(filepath)) {
        // 设置下载的文件名称
        let downloadFilename = new Date().getTime() + fileutils.getSuffix(filename);
        ctx.set('Content-disposition', 'attachment;filename=' + downloadFilename);
        let buffer = fileutils.readBuffer(filepath);
        ctx.body = buffer;
    } else {
        ctx.json = '抱歉，文件不存在或路径有误！';
    }
});


module.exports = router;
