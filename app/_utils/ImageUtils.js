const path = require('path');
const gm = require('gm').subClass({imageMagick: true});
const FileUtils = require('./FileUtils');
const appcfg = require('../_config/appcfg');

let ImageUtils = {};

/**
 * 获取处理后的图片路径
 * @param fromImgPath 图片原路径
 * @param options 选项
 * @returns {Promise<any>}
 */
ImageUtils.processImg = function (fromImgPath, options) {
    options = options || {};
    let colorspace = options.colorspace || 'gray';
    let threshold = options.threshold || '50%';
    let fromImageName = FileUtils.getFileName(fromImgPath);
    let toFilepath = path.join(appcfg.temp.rootpath, "_ImageMagick", FileUtils.newFilename(fromImageName));
    FileUtils.mkdirs(FileUtils.getDirname(toFilepath));

    return new Promise((resolve, reject) => {
        gm(fromImgPath)
            .colorspace(colorspace)
            .normalize()
            .threshold(threshold)
            .write(toFilepath, function (err) {
                if (err)
                    return reject(err);
                resolve(toFilepath);
            });
    });
}

module.exports = ImageUtils;