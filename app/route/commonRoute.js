/**
 * 公用路由
 */

const path = require('path');
const router = require('koa-router')();
const sendfile = require('koa-sendfile');// 文件下载

const appcfg = require('../_config/appcfg');
const FileUtils = require('../_utils/FileUtils');

const ResultUtils = require('../_utils/ResultUtils');
const BaiduAIUtils = require('../_utils/BaiduAIUtils');

router.prefix('/common');

/**
 * 文件上传，post
 */
router.post('/upload', async (ctx, next) => {
    // 上传单个文件
    const xfile = ctx.request.files.xfile; // 获取上传文件
    const midpath = ctx.request.body.midpath || "";// 中间路径，类似于模块名

    if (!xfile) {
        return ctx.body = ResultUtils.errorMsg("无法匹配name='xfile'的文件！");
    } else {
        // 上传单个文件
        try {
            let uploadResult = FileUtils.upload(xfile, midpath);
            return ctx.body = ResultUtils.successData(uploadResult);
        } catch (e) {
            return ctx.body = ResultUtils.errorMsg("上传失败");
        }
    }
});

/**
 * 上传Base64图片，post
 */
router.post('/uploadBase64Img', async (ctx, next) => {

    //接收前台POST过来的base64
    let base64Img = ctx.parameters.base64Img;
    let midpath = ctx.parameters.midpath || '';

    if (!base64Img) {
        return ctx.body = ResultUtils.errorMsg("无法匹配name='base64Img'的数据");
    }
    // 上传单个文件
    try {
        let uploadResult = FileUtils.uploadBase64Img(base64Img, midpath);
        return ctx.body = ResultUtils.successData(uploadResult);
    } catch (e) {
        return ctx.body = ResultUtils.errorMsg("上传失败");
    }
});

/**
 * 文件下载，get
 */
router.get('/download', async function downloadFile(ctx, next) {

    let midpath = ctx.query.midpath || "";// 中间路径，类似于模块名
    let filename = ctx.query.filename;// 文件名称
    let filepath = path.join(appcfg.base_cfg.upload.rootpath, midpath, filename);// 文件服务器路径

    if (FileUtils.existFile(filepath)) {
        ctx.attachment(decodeURI(filepath));
        await sendfile(ctx, filepath);
    } else {
        ctx.body = ResultUtils.errorMsg('抱歉，文件不存在或路径有误！');
    }
});

/**
 * 解析图片验证码
 */
router.post('/resolveCode', async function downloadFile(ctx, next) {
    try {
        //接收前台POST过来的base64
        let base64Img = ctx.parameters.base64Img;
        if (!base64Img) {
            return ctx.body = ResultUtils.errorMsg("无法匹配name='base64Img'的数据");
        }
        let uploadResult = FileUtils.uploadBase64Img(base64Img, '');
        let uploadImgpath = uploadResult.filepath;
        let text = await BaiduAIUtils.recognize(uploadImgpath);
        return ctx.body = ResultUtils.successData(text);
    } catch (e) {
        return ctx.body = ResultUtils.errorMsg('解析验证码异常，' + e.toString());
    }
});


module.exports = router;
