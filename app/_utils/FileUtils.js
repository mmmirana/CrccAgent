const fs = require('fs');
const path = require('path');
const appcfg = require('../_config/appcfg');

const randomUtils = require('./RandomUtils');

let FileUtils = {}

/**
 * 根据路径获取文件名
 * @param filepath
 * @returns {*}
 */
FileUtils.getFileName = function (filepath) {
    filepath = filepath.replace(/\/{1,2}/g, '\\');
    let lastSpeatorIndex = filepath.lastIndexOf('\\');

    let filename = filepath;
    if (lastSpeatorIndex >= 0) {
        filename = filepath.substring(lastSpeatorIndex + 1, filepath.length);
    }
    return filename;
}

/**
 * 获取文件前缀
 * @param filename
 * @returns {*}
 */
FileUtils.getPreffix = function (filename) {
    filename = this.getFileName(filename);
    let lastSpeatorIndex = filename.lastIndexOf('.');

    let preffix = filename;
    if (lastSpeatorIndex >= 0) {
        preffix = filename.substring(0, lastSpeatorIndex);
    }
    return preffix;
}

/**
 * 获取文件后缀
 * @param filename
 * @returns {string}
 */
FileUtils.getSuffix = function (filename) {
    filename = this.getFileName(filename);
    let lastSpeatorIndex = filename.lastIndexOf('.');

    let suffix = '';
    if (lastSpeatorIndex >= 0) {
        suffix = filename.substring(lastSpeatorIndex, filename.length);
    }
    return suffix;
}

/**
 * 获取文件或者文件夹的上级文件夹
 * @param filepath
 * @returns {string}
 */
FileUtils.getDirname = function (filepath) {
    return path.dirname(filepath);
}

/**
 * 判断文件或文件夹是否存在
 * @param filepath
 * @returns {boolean}
 */
FileUtils.exist = function (filepath) {
    return fs.existsSync(filepath);
}

/**
 * 判断文件是否存在
 * @param filepath
 * @returns {boolean}
 */
FileUtils.existFile = function (filepath) {
    if (fs.existsSync(filepath)) {
        let stat = fs.statSync(filepath);
        if (stat.isFile()) {
            return true;
        }
    }
    return false;
}

/**
 * 判断文件夹是否存在
 * @param dirpath
 * @returns {boolean}
 */
FileUtils.existDir = function (dirpath) {
    if (fs.existsSync(dirpath)) {
        let stat = fs.statSync(dirpath);
        if (stat.isDirectory()) {
            return true;
        }
    }
    return false;
}

/**
 * 递归创建文件夹
 *
 * @param dirpath
 * @returns {boolean}
 */
FileUtils.mkdirs = function (dirpath) {
    if (fs.existsSync(dirpath)) {
        return true;
    } else {
        if (this.mkdirs(this.getDirname(dirpath))) {
            fs.mkdirSync(dirpath);
            return true;
        }
    }
}


/**
 * 上传文件
 * @param xfile ctx.request.files.xfile
 * @param midpath 中间路径
 * @returns {string} 上传成功，返回上传到服务器的地址
 */
FileUtils.upload = function (xfile, midpath) {
    // 源文件
    let fromFilename = xfile.name;

    // 生成新的文件名
    let toFilename = FileUtils.newFilename(fromFilename);

    // 目标文件绝对路径
    let filePath = path.resolve(appcfg.base_cfg.upload.rootpath, midpath, toFilename);
    // 如果上级目录不存在，则创建
    FileUtils.mkdirs(this.getDirname(filePath));

    // 传输文件
    const reader = fs.createReadStream(xfile.path);
    const upStream = fs.createWriteStream(filePath);
    reader.pipe(upStream);

    // 返回目标文件的地址
    return filePath;
}

/**
 * 根据原文件名生成新的文件名
 * @param fromFilename
 * @returns {string}
 */
FileUtils.newFilename = function (fromFilename) {
    // 当前时间毫秒数
    let timemills = new Date().getTime();
    // 5位随机码
    let randomStr = randomUtils.generateRandom(5, randomUtils.randomType.number + randomUtils.randomType.letterLower);
    // 目标文件名称规则：文件前缀+'_'+时间戳+5位随机码+文件后缀
    let toFilename = FileUtils.getPreffix(fromFilename) + '_' + timemills + '_' + randomStr + FileUtils.getSuffix(fromFilename);
    return toFilename;
}

/**
 * 读取文件buffer
 * @param filepath
 * @returns {Buffer}
 */
FileUtils.readBuffer = function (filepath) {
    return fs.readFileSync(filepath);
}

module.exports = FileUtils;