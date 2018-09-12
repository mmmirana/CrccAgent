let schedule = require('node-schedule');
let DateUtils = require('../../_utils/DateUtils');
let jobservice_clearCache = require('./jobservice_clearCache');

let job = {};
job.runJob = function ({groupname, jobname, cron}) {

    let TAG = "[ JOB running ] 清除文件缓存 ";

    schedule.scheduleJob(jobname, cron, function () {
        console.log(TAG + DateUtils.format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        jobservice_clearCache.clearFileCache().then(function (data) {
            console.log(TAG + " 结果：" + data);
        }).catch(function (e) {
            console.log(TAG + " 异常：" + e.toString());
        });
    });
};

module.exports = job;