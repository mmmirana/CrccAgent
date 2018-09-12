const BaseModel = require('../../base/model/BaseModel');

class model extends BaseModel {

    /**
     * 查询已同步的消除隐患数目和已经消除的隐患数目
     *
     * @param appid
     * @param ymd
     * @returns {Promise<*|number>}
     */
    async getSomedayRmData(appid, ymd) {
        let syncSql = `SELECT
	count( 1 ) AS count 
FROM
	yinhuan_rmdanger t 
WHERE
	1 = 1 
	AND t.appid =? 
	AND t.check_time =?`;

        let removeSql = `SELECT
	count( 1 ) AS count 
FROM
	yinhuan_rmdanger t 
WHERE
	1 = 1 
	AND t.sstatus = 1 
	AND t.appid =? 
	AND t.check_time =?`;

        let params = [appid, ymd];

        // 已同步数据统计
        let syncResult = await super.query(syncSql, params);
        // 已消除数据统计
        let removeResult = await super.query(removeSql, params);

        let syncNumber = syncResult[0].count || 0;
        let removeNumber = removeResult[0].count || 0;


        return {syncNumber, removeNumber};
    }
}

module.exports = new model("yinhuan_rmdanger");