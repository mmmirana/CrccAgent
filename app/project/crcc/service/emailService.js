let MysqlUtils = require('../../../_utils/MysqlUtils');

let service = {};

/***
 * 获取分组授权email
 * @return {Promise<void>}
 */
service.getAuthEmailGroupbyAppid = async function () {
    let sql = `SELECT
	t.appid,
	t.email 
FROM
	basic_auth t 
WHERE
	t.\`enable\` = 1 
GROUP BY
	t.appid,
	t.email`;

    let authEmailResult = await MysqlUtils.query(sql, []);

    let authEmail = {};
    for (let i = 0; i < authEmailResult.length; i++) {
        let authEmailItem = authEmailResult[i];
        let appid = authEmailItem.appid;
        let email = authEmailItem.email;
        if (authEmail[appid]) {
            let emailArr = authEmail[appid];
            emailArr.push(email);
            authEmail[appid] = emailArr;
        } else {
            let emailArr = [email];
            authEmail[appid] = emailArr;
        }
    }
    return authEmail;
};

module.exports = service;