const appcfg = require("../../../_config/appcfg");
const pkname = appcfg.mysql_cfg.pk_name;
const MysqlUtils = require('../../../_utils/MysqlUtils')

class BaseModel {
    constructor(tablename) {
        this.tablename = tablename;
    }

    /**
     * 根据sql语句和params查询
     * @param sql
     * @param params
     * @returns {Promise<*>}
     */
    async query(sql, params) {
        return await MysqlUtils.query(sql, params);
    }

    /**
     * 新增
     * @param row
     * @returns {Promise<void>}
     */
    async insert(row) {
        return await MysqlUtils.insert(this.tablename, row);
    };

    /**
     * 根据主键更新数据
     * @param pkVal 主键值
     * @param row 更新的数据
     * @returns {Promise<*>}
     */
    async updateByPk(row, pkVal) {
        return await MysqlUtils.updateByPk(this.tablename, row, pkVal);
    }

    /**
     * 根据where更新数据
     * @param row
     * @param where
     * @returns {Promise<*>}
     */
    async update(row, where) {
        return await MysqlUtils.update(this.tablename, row, where);
    }


    /**
     * 查询
     * @param where
     * @param columns
     * @param orders
     * @returns {Promise<*>}
     */
    async select(where, columns, orders) {
        return await MysqlUtils.select(this.tablename, where, columns, orders);
    };

    /**
     * 查询单条数据
     * @param where
     * @param columns
     * @param orders
     * @return {Promise<*>}
     */
    async selectOne(where, columns, orders) {
        return await MysqlUtils.selectOne(this.tablename, where, columns, orders);
    }

    /**
     * 根据主键ID查询唯一
     * @param pk
     * @returns {Promise<*>}
     */
    async selectByPk(pk) {
        return await MysqlUtils.selectByPk(this.tablename, pk);
    }


    /**
     * 统计个数
     * @param where
     * @returns {Promise<*>} 直接返回个数
     */
    async count(where) {
        return await MysqlUtils.count(this.tablename, where);
    };

    /**
     * 根据where删除数据
     * @param where
     * @return {Promise<*>}
     */
    async delete(where) {
        return await MysqlUtils.delete(this.tablename, where);
    }

    /**
     * 根据where删除数据
     * @param where
     * @return {Promise<*>}
     */
    async deleteByPk(pk) {
        return await MysqlUtils.deleteByPk(this.tablename, pk);
    }
}

module.exports = BaseModel;