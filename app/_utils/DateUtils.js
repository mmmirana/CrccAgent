/**
 * 格式化日期
 *
 * 示例：
 *    var date = new Date();
 *    console.log(DateUtils.format(date));                                          //2016-08-11 13:19:44
 *
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.FULL_BLANK));            //2016 08 11 13:19:44
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.FULL_DASH));             //2016-08-11 13:19:44
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.FULL_NOSYMBOL));         //20160811131944
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.FULL_SLASH));            //2016/08/11 13:19:44
 *
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.SIMPLE_BLANK));          //2016 08 11
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.SIMPLE_DASH));           //2016-08-11
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.SIMPLE_NOSYMBOL));       //20160811
 *    console.log(DateUtils.format(date, DateUtils.PATTERN.SIMPLE_SLASH));          //2016/08/11
 *
 *    @author Assassin
 *
 */

let DateUtils = {
    PATTERN: {
        /** 空格符号 yyyy MM dd HH:mm:ss * */
        FULL_BLANK: "yyyy MM dd HH:mm:ss",
        /** 破折符号 yyyy-MM-dd HH:mm:ss * */
        FULL_DASH: "yyyy-MM-dd HH:mm:ss",
        /** 斜杠符号 yyyy/MM/dd HH:mm:ss * */
        FULL_SLASH: "yyyy/MM/dd HH:mm:ss",
        /** 没有符号 yyyyMMddHHmmss * */
        FULL_NOSYMBOL: "yyyyMMddHHmmss",
        /** 空格符号 yyyy MM dd * */
        SIMPLE_BLANK: "yyyy MM dd",
        /** 破折符号 yyyy-MM-dd * */
        SIMPLE_DASH: "yyyy-MM-dd",
        /** 斜杠符号 yyyy/MM/dd * */
        SIMPLE_SLASH: "yyyy/MM/dd",
        /** 没有符号 yyyyMMdd * */
        SIMPLE_NOSYMBOL: "yyyyMMdd"
    }
};

/**
 * 将日期格式化为字符串
 *
 * @param date
 * @param pattern
 */
DateUtils.formatDate = function (date, pattern) {
    var z = {
        M: date.getMonth() + 1,
        d: date.getDate(),
        H: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
    };
    pattern = pattern.replace(/(M+|d+|H+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1)))
            .slice(-2)
    });
    return pattern.replace(/(y+)/g, function (v) {
        return date.getFullYear().toString().slice(-v.length)
    });
};

/**
 * 按pattern的格式时间为字符串，如果不传值，默认“"yyyy-MM-dd HH:mm:ss"”
 *
 * @param date
 * @param pattern
 */
DateUtils.format = function (date, pattern) {
    if (!pattern) {
        pattern = DateUtils.PATTERN.FULL_DASH;
    }
    return this.formatDate(date, pattern);
};

module.exports = DateUtils;