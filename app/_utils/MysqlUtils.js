const rds = require('ali-rds');
const appcfg = require('../_config/appcfg');
const pkFieldname = appcfg.mysql_cfg.pk_name;// 主键字段名，一般为id，这里定义为sid

const db = rds({
    host: appcfg.mysql.host,
    port: appcfg.mysql.port,
    user: appcfg.mysql.user,
    password: appcfg.mysql.password,
    database: appcfg.mysql.database,
});


let MysqlUtils = {};

MysqlUtils.db = db;

MysqlUtils.query = async function (sql, params) {
    return await this.db.query(sql, params);
};

/**
 * 新增
 * @param row
 * @returns {Promise<void>}
 */
MysqlUtils.insert = async function (tablename, row) {
    return await this.db.insert(tablename, row);
};

/**
 * 根据主键更新数据
 * @param tablename 表明
 * @param pkVal 主键值
 * @param row 更新的数据
 * @returns {Promise<*>}
 */
MysqlUtils.updateByPk = async function (tablename, row, pkVal) {
    let where = {};
    where[pkFieldname] = pkVal;
    return await this.update(tablename, row, where);
}

/**
 * 根据where更新数据
 * @param tablename
 * @param row
 * @param where
 * @returns {Promise<*>}
 */
MysqlUtils.update = async function (tablename, row, where) {
    return await this.db.update(tablename, row, {
        where: where
    });
}

/**
 * 查询
 * @param tablename
 * @param where
 * @param columns
 * @param orders
 * @returns {Promise<*>}
 */
MysqlUtils.select = async function (tablename, where, columns, orders) {
    let options = {
        where,
        columns,
        orders,
    };
    return await this.db.select(tablename, options);
};

/**
 * 查询
 * @param tablename
 * @param where
 * @param columns
 * @param orders
 * @returns {Promise<*>}
 */
MysqlUtils.selectOne = async function (tablename, where, columns, orders) {
    let options = {
        where,
        columns,
        orders,
    };

    let dbresult = await this.db.select(tablename, options);

    if (dbresult) {
        if (dbresult.length === 1) {
            return dbresult[0]
        } else {
            throw new Error(`[ selectOne ] 查询数据不唯一, tablename: ${tablename}, where: ${where}`);
        }
    } else {
        return null;
    }
};

/**
 * 根据主键ID查询唯一
 * @param tablename
 * @param pk
 * @returns {Promise<*>}
 */
MysqlUtils.selectByPk = async function (tablename, pk) {
    let where = {};
    where[pkFieldname] = pk;
    return await this.selectOne(tablename, where);
};


/**
 * 统计个数
 * @param tablename
 * @param where
 * @returns {Promise<*>} 直接返回个数
 */

MysqlUtils.count = async function (tablename, where) {
    return await this.db.count(tablename, where);
};

/**
 * 统计个数
 * @param tablename
 * @param where
 * @returns {Promise<*>} 直接返回个数
 */

MysqlUtils.delete = async function (tablename, where) {
    return await this.db.delete(tablename, where);
};

/**
 * 统计个数
 * @param tablename
 * @param pk 主键id
 * @returns {Promise<*>} 直接返回个数
 */

MysqlUtils.deleteByPk = async function (tablename, pk) {
    let where = {};
    where[pkFieldname] = pk;
    return await this.db.delete(tablename, where);
};

module.exports = MysqlUtils;
