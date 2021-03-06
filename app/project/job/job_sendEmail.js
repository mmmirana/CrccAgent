let schedule = require('node-schedule');
let DateUtils = require('../../_utils/DateUtils');
let jobservice_sendEmail = require('./jobservice_sendEmail');

let job = {};
job.runJob = function ({groupname, jobname, cron}) {

    let TAG = "[ JOB running ] 发送邮件 ";

    schedule.scheduleJob(jobname, cron, function () {
        console.log(TAG + DateUtils.format(new Date(), 'yyyy-MM-dd HH:mm:ss'));

        jobservice_sendEmail.sendEmail().then(function (data) {
            console.log(TAG + " 结果：" + data);
        }).catch(function (e) {
            console.log(TAG + " 异常：" + e.toString());
        });
    });
};

module.exports = job;