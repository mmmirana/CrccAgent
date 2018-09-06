const BaseModel = require('../../base/model/BaseModel');

class model extends BaseModel {
    /**
     * 查询已提交的组数
     *
     * @param ymd
     * @returns {Promise<*|number>}
     */
    async getSomedayData(ymd) {
        let genSql = `SELECT
	count( 1 )  as count
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND DATE_FORMAT( t.create_time, "%Y-%m-%d" ) = ?`;
        let submitSql = `SELECT
	count( 1 )  as count
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND t.\`status\` = 3
	AND DATE_FORMAT( t.create_time, "%Y-%m-%d" ) = ?`;

        let params = [ymd];

        // 生成数据统计
        let genResult = await super.query(genSql, params);
        // 提交数据统计
        let submitResult = await super.query(submitSql, params);

        let genNumber = genResult[0].count || 0;
        let submitNumber = submitResult[0].count || 0;


        return {genNumber, submitNumber,};
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
	AND t.sid >= ( SELECT FLOOR( MAX( sid ) * RAND( ) ) FROM yinhuan_postdata ) 
ORDER BY
	t.sid 
	LIMIT ?`;
        let params = [date, number];

        return await super.query(sql, params);
    }
}

module.exports = new model("yinhuan_postdata");