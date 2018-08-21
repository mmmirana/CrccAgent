let ResultUtils = {}

/**
 * 返回的结果集
 */
class result {
    constructor(code, data, msg) {
        this.code = code;
        this.data = data;
        this.msg = msg;
    }

    toJson() {
        return JSON.stringify(this || "");
    }
}

/**
 * 构造一个成功的结果集
 * @param data 返回的数据
 * @param msg 返回的消息
 * @returns {result}
 */
ResultUtils.success = function (data, msg) {
    return this.build(1, data, msg || '操作成功');
};

/**
 * 构造一个成功的结果
 * @param data 返回的数据
 * @returns {result}
 */
ResultUtils.successData = function (data) {
    return this.success(data);
};

/**
 * 构造一个成功的结果
 * @param msg 返回的消息
 * @returns {result}
 */
ResultUtils.successMsg = function (msg) {
    return this.success(null, msg);
};

/**
 * 构造一个失败的结果
 * @param data 返回的数据
 * @param msg 返回的消息
 * @returns {result}
 */
ResultUtils.error = function (data, msg) {
    return this.build(0, data, msg || '抱歉，操作失败');
};

/**
 * 构造一个失败的结果
 * @param data 返回的数据
 * @returns {result}
 */
ResultUtils.errorData = function (data) {
    return this.error(data);
};

/**
 * 构造一个失败的结果
 * @param msg 返回的消息
 * @returns {result}
 */
ResultUtils.errorMsg = function (msg) {
    return this.error(null, msg);
};

/**
 * 构造结果
 * @param code
 * @param data
 * @param msg
 * @returns {result}
 */
ResultUtils.build = function (code, data, msg) {
    return new result(code, data, msg).toJson();
};

module.exports = ResultUtils;