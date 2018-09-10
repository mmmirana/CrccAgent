let schedule = require('node-schedule');
let DateUtils = require('../../_utils/DateUtils');
let jobservice_sendEmail = require('./jobservice_sendEmail');

let job = {};
job.runJob = function ({groupname, jobname, cron}) {

    schedule.scheduleJob(jobname, cron, function () {
        let ymdhms = DateUtils.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        console.log(jobname, ymdhms);
        jobservice_sendEmail.sendEmail();
    });
};

module.exports = job;