let EmailUtils = require('../../_utils/EmailUtils');
let DateUtils = require('../../_utils/DateUtils');
let ResultUtils = require('../../_utils/ResultUtils');
let emailService = require('../crcc/service/emailService');
let yinhuan_postdataModel = require('../crcc/model/yinhuan_postdataModel');
let yinhuan_rmdangerModel = require('../crcc/model/yinhuan_rmdangerModel');


let service = {};

service.sendEmail = async function () {
    try {

        let nowDate = new Date();
        let ymdhms = DateUtils.format(nowDate, 'yyyy-MM-dd HH:mm:ss');
        let ymd = DateUtils.format(nowDate, 'yyyy-MM-dd');

        let authEmails = await emailService.getAuthEmailGroupbyAppid();
        for (let i in authEmails) {
            let appid = i;
            let toEmails = authEmails[i];

            let {genNumber, submitNumber} = await yinhuan_postdataModel.getSomedayData(appid, ymd);
            let {syncNumber, removeNumber} = await yinhuan_rmdangerModel.getSomedayRmData(appid, ymd);

            let text = this.generateEmailText(ymdhms, {genNumber, submitNumber}, {syncNumber, removeNumber});

            if (authEmails[i].length > 0) {
                let emialOps = {
                    toEmails: toEmails, // 收件人
                    ccEmails: ['mmmirana@qq.com'], // 抄送
                    bccEmails: ['18166748035@163.com'], // 密送
                    subject: `${ymd} 某铁数据提交插件数据统计`,
                    text: text,
                };
                let info = await EmailUtils.send(emialOps);
                console.log(JSON.stringify(info));
            }
        }
        return ResultUtils.successMsg("发送邮件成功 ");
    } catch (e) {
        return ResultUtils.errorMsg("发送邮件异常: " + e.toString());
    }
};

/**
 * 生成邮箱文本
 * @param ymdhms
 * @param genNumber
 * @param submitNumber
 * @param syncNumber
 * @param removeNumber
 * @return {string}
 */
service.generateEmailText = function (ymdhms, {genNumber, submitNumber}, {syncNumber, removeNumber}) {
    let text = `
尊敬的用户：
    您好！
    
    截止 ${ymdhms}, 您所在的项目部今日填报隐患和消除隐患数据如下：
    
    填报：已生成“填报隐患” ${genNumber} 组，已填报 ${submitNumber} 组，每组约20条记录；
    消除：已同步“消除隐患” ${syncNumber} 条，已消除 ${removeNumber} 条。
    
    感谢您的使用，如有疑问，请回复信息至本邮箱。`;
    return text;
}

module.exports = service;