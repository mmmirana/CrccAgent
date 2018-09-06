let xlsx = require('node-xlsx').default;

let ExcelUtils = {};

/**
 * 读取所有的sheet
 * @param filepath
 * @returns {*}
 */
ExcelUtils.read = function (filepath) {
    const workSheetsFromFile = xlsx.parse(filepath);
    return workSheetsFromFile;
};

/**
 * 读取sheetIndex的sheet
 * @param filepath
 * @param sheetIndex
 * @returns {*}
 */
ExcelUtils.readSheet = function (filepath, sheetIndex) {
    return this.read(filepath)[sheetIndex];
};

/**
 * 读取所有的rows
 * @param filepath
 * @param sheetIndex
 * @returns {*}
 */
ExcelUtils.readRows = function (filepath, sheetIndex) {
    sheetIndex = sheetIndex || 0;
    return this.readSheet(filepath, sheetIndex).data;
};

/**
 * 读取Excel里面的日期为数字，这里将对应的数值转为Date
 * @param cellval
 * @returns {Date}
 */
ExcelUtils.convertCell2Date = function (cellval) {
    return new Date(1900, 0, cellval - 1);
};

module.exports = ExcelUtils;