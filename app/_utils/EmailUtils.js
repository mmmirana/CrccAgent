let nodemailer = require('nodemailer');
let MysqlUtils = require('./MysqlUtils');

let EmailUtils = {};

/**
 * 初始化获取主邮箱
 * @param email 可选参数，如果不传，则默认取第一个可以使用的主邮箱
 * @return {Promise<*>}
 */
EmailUtils.init = async function (email) {
    let sql = `SELECT
	t.email,
	t.authcode,
	cfg.usessl,
	cfg.smtp_server,
	cfg.smtp_port,
	cfg.smtp_port_ssl
FROM
	email_auth t
	LEFT JOIN email_config cfg ON t.type = cfg.type 
WHERE
	1 = 1 
	AND t.\`enable\` = 1`;
    let params = [];
    if (email) {
        sql += ` AND t.email = ?`;
        params.push(email);
    }
    let dbResult = await MysqlUtils.query(sql, params);
    if (dbResult && dbResult.length > 0) {
        return dbResult[0];
    } else {
        if (email) {
            throw new Error(`无法匹配授权邮箱'${email}'，或该邮箱尚未启用`);
        } else {
            throw new Error(`无法匹配授权主邮箱，或该邮箱尚未启用`);
        }
    }
};


/**
 * 发送邮件
 * @param emailOps
 */
EmailUtils.send = async function (emailOps) {
    return new Promise(async function (resolve, reject) {
        try {
            let fromEmail = emailOps.fromEmail || '';
            let fromEmailModel = await EmailUtils.init(fromEmail);
            let useSSL = (fromEmailModel.usessl || 0) === 1;// 是否使用ssl
            let ops = {
                host: fromEmailModel.smtp_server, // SMTP服务器
                port: useSSL ? fromEmailModel.smtp_port_ssl : fromEmailModel.smtp_port, // SMTP 端口
                secure: useSSL, // 使用 SSL
                auth: {
                    user: fromEmailModel.email,
                    pass: fromEmailModel.authcode,
                }
            };

            let transporter = nodemailer.createTransport(ops);

            let mailOptions = {
                from: fromEmailModel.email, // sender address
                to: emailOps.toEmails.join(','), // list of receivers
                cc: emailOps.ccEmails.join(','), // list of receivers
                subject: emailOps.subject, // Subject line
                text: emailOps.text, // plain text body
                html: emailOps.html // html body
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) reject(error);
                resolve(info);
            })
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = EmailUtils;