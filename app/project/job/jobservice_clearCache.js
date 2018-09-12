const path = require('path');
const glob = require('glob');
const ResultUtils = require('../../_utils/ResultUtils');
const FileUtils = require('../../_utils/FileUtils');
const DateUtils = require('../../_utils/DateUtils');
const yinhuan_postdataModel = require('../crcc/model/yinhuan_postdataModel');
const yinhuan_rmdangerModel = require('../crcc/model/yinhuan_rmdangerModel');

let service = {};

/**
 * 清除文件缓存
 * @return {Promise<result>}
 */
service.clearFileCache = async function () {

    try {
        let cacheFiles = []
        let imFiles = glob.sync('web/_temp/_ImageMagick/*.png');
        let upFiles = glob.sync('web/_upload/*.png');

        cacheFiles = cacheFiles.concat(imFiles).concat(upFiles);

        for (let i = 0; i < cacheFiles.length; i++) {
            let catchFile = cacheFiles[i];
            let catchFilePath = path.join(__dirname, path.relative(__dirname, catchFile));
            FileUtils.deleteAsbpath(catchFilePath);
        }
        return ResultUtils.successMsg("删除文件缓存成功");
    } catch (e) {
        return ResultUtils.errorMsg("删除文件缓存异常: " + e.toString());
    }
};

/**
 * 清除数据缓存
 * @return {Promise<result>}
 */
service.clearDataCache = async function () {

    // 缓存期限
    let cacheExpire = 7;

    let nowDate = new Date();// 当前日期
    let clearDate = nowDate;
    clearDate.setDate(nowDate.getDate() - cacheExpire);// 要清理的日期
    let clearDateStr = DateUtils.format(clearDate, 'yyyy-MM-dd');// 要清理的日期字符串

    try {
        // 删除yinhuan_postdata
        let delPostdataSql = `DELETE t 
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND t.posttime < ?`;
        let delPostdataParams = [clearDateStr];

        let delPostdataResult = await yinhuan_postdataModel.query(delPostdataSql, delPostdataParams);

        // 删除yinhuan_rmdanger
        let delRmdangerSql = `DELETE t 
FROM
	yinhuan_rmdanger t 
WHERE
	1 = 1 
	AND t.create_time < ?`;
        let delRmdangerParams = [clearDateStr];

        let delRmdangerResult = await yinhuan_rmdangerModel.query(delRmdangerSql, delRmdangerParams);

        let delPostdataCount = delPostdataResult.affectedRows;
        let delRmdangerCount = delRmdangerResult.affectedRows;

        return ResultUtils.successMsg("删除数据缓存结果：" + JSON.stringify({delPostdataCount, delRmdangerCount}));
    } catch (e) {
        return ResultUtils.errorMsg("删除数据缓存异常: " + e.toString());
    }
};

module.exports = service;