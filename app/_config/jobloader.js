/**
 * 路由加载器，负责加载appcfg中指定的路由文件
 */
const path = require('path');
const glob = require('glob');
const appcfg = require('./appcfg');
const MysqlUtils = require('../_utils/MysqlUtils');

let jobloader = {};

jobloader.run = async function () {
    // 同步获取所有的root文件
    let jobFiles = glob.sync(appcfg.base_cfg.job.filepattern);

    jobFiles.forEach(async function (jobFile) {
        console.log('[ JOB ]正在加载任务', jobFile);
        let jobModel = await getJobModel(jobFile);
        if (jobModel) {
            console.log('[ JOB ]运行任务', jobFile);
            let jobItem = require(path.relative(__dirname, jobFile));
            jobItem.runJob({
                groupname: jobModel.groupname,
                jobname: jobModel.jobname,
                cron: jobModel.cron,
            });
        }
    });
}

/**
 * 从数据库获取任务
 * @param filepath
 * @return {Promise<*>}
 */
async function getJobModel(filepath) {
    let sql = `SELECT
	* 
FROM
	job_config t 
WHERE
	1 = 1 
	AND t.filepath =? 
	AND t.\`enable\` = 1`;
    let params = [filepath];

    let dbResult = await MysqlUtils.query(sql, params);
    if (dbResult && dbResult.length > 0) {
        return dbResult[0];
    }
}

module.exports = jobloader;