const BaseModel = require('../../base/model/BaseModel');

class model extends BaseModel {
    /**
     * 查询已提交的组数
     *
     * @param appid
     * @param ymd
     * @returns {Promise<*|number>}
     */
    async getSomedayData(appid, ymd) {
        let genSql = `SELECT
	count( 1 ) AS count 
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND t.appid = ?
	AND t.posttime = ?`;

        let submitSql = `SELECT
	count( 1 ) AS count 
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND t.\`status\` = 1
	AND t.appid = ? 
	AND t.posttime = ?`;

        let params = [appid, ymd];

        // 生成数据统计
        let genResult = await super.query(genSql, params);
        // 提交数据统计
        let submitResult = await super.query(submitSql, params);

        let genNumber = genResult[0].count || 0;
        let submitNumber = submitResult[0].count || 0;


        return {genNumber, submitNumber};
    }

    /**
     * 查询随机提交的数据
     * @param number 条数
     * @param date 日期
     * @returns {Promise<*>}
     */
    async queryRandomPostData(number, date) {
        let sql = `SELECT
	* 
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND t.\`status\` = 0 
	AND DATE_FORMAT( t.create_time, "%Y-%m-%d" ) = ? 
ORDER BY
	RAND( ) 
	LIMIT ?`;
        let params = [date, number];

        return await super.query(sql, params);
    }
}

module.exports = new model("yinhuan_postdata");