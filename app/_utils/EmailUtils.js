let nodemailer = require('nodemailer');
let MysqlUtils = require('./MysqlUtils');

let EmailUtils = {};

EmailUtils.init = async function (email) {
    let sql = `SELECT
	t.email,
	t.authcode,
	cfg.pop3_server,
	cfg.pop3_port,
	cfg.pop3_port_ssl,
	cfg.smtp_server,
	cfg.smtp_port,
	cfg.smtp_port_ssl,
	cfg.imap_server,
	cfg.imap_port,
	cfg.imap_port_ssl 
FROM
	email_auth t
	LEFT JOIN email_config cfg ON t.type = cfg.type 
WHERE
	1 = 1 
	AND t.\`enable\` = 1 
	AND t.email = ?`;
    let params = [email];
    let dbResult = await MysqlUtils.query(sql, params);
    if (dbResult && dbResult.length > 0) {
        return dbResult[0];
    } else {
        throw new Error(`无法匹配授权邮箱'${email}'，或该邮箱尚未启用`);
    }
};


/**
 * 发送邮件
 * @param emailOps
 */
EmailUtils.send = async function (emailOps) {
    return new Promise(async function (resolve, reject) {
        try {
            let fromEmail = emailOps.fromEmail;
            let fromEmailModel = await EmailUtils.init(fromEmail);
            let ops = {
                host: fromEmailModel.smtp_server, // SMTP服务器
                port: fromEmailModel.smtp_port_ssl, // SMTP 端口
                secure: true, // 使用 SSL
                auth: {
                    user: fromEmailModel.email,
                    pass: fromEmailModel.authcode,
                }
            };
            let transporter = nodemailer.createTransport(ops);

            let mailOptions = {
                from: fromEmail, // sender address
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