let ExcelUtils = require('../../../_utils/ExcelUtils');
let MysqlUtils = require('../../../_utils/MysqlUtils');
let service = {};


service.readYinhuanProblem = async function (filepath, preffix, reset) {

    let index = 0;// index

    let yinhuanArr = [];

    let yinhuanItem = {
        head: '',
        problem: []
    };

    let rows = ExcelUtils.readRows(filepath, 0);
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (i <= 1) {
            continue;
        }

        let headerRow = [];//标题行

        if (!row[0]) {// 当前为空
            headerRow = row;
            if (yinhuanItem.problem.length !== 0) {
                yinhuanArr.push(yinhuanItem);
            }
            yinhuanItem = {
                head: row[1],
                problem: []
            };
        } else {
            let currentProblem = {
                index: row[0],
                name: row[1],
                problem: row[2],
                level: row[3],
                affect: row[4],
            };
            yinhuanItem.problem.push(currentProblem);
        }
    }


    // 是否要重置数据
    if (reset) {
        try {
            let dbresult = await MysqlUtils.query("TRUNCATE TABLE basic_problem");
            console.log("清空数据结果：" + JSON.stringify(dbresult));
        } catch (e) {
            console.log("清空数据发生异常：" + e.toString());
            return;
        }
    }

    for (let i = 0; i < yinhuanArr.length; i++) {
        let yinhuanItem = yinhuanArr[i];
        let yinhuanNodename = yinhuanItem.head;
        let yinhuanProblemItems = yinhuanItem.problem;

        let where = {
            danger_longname: yinhuanNodename
        };
        let count = await MysqlUtils.count("basic_nodes", where);
        if (count === 1) {
            let yinhuanNodes = await MysqlUtils.select('basic_nodes', where);
            let yinhuanNode = yinhuanNodes[0];

            for (let j = 0; j < yinhuanProblemItems.length; j++) {
                let yinhuanProblemItem = yinhuanProblemItems[j];


                yinhuanProblemItem.problem = preffix + yinhuanProblemItem.problem;

                yinhuanProblemItem = Object.assign(yinhuanProblemItem, {
                    node_sid: yinhuanNode.sid,
                    node_id: yinhuanNode.id,
                    appid: yinhuanNode.appid,
                    node_name: yinhuanNode.danger_longname,
                });

                let result = await MysqlUtils.insert('basic_problem', yinhuanProblemItem);
                console.log(++index, JSON.stringify(result));
            }
        }
    }
};

// // 将隐患从Excel导入数据库
// service.readYinhuanProblem('F:\\Project\\郭浩\\安全隐患库.xlsx', "经检查发现隐患：", true)
//     .then(function (data) {
//         console.log('over');
//     }).catch(function (e) {
//     console.log(e);
// });

// 将隐患从Excel导入数据库
service.readYinhuanProblem('F:\\Project\\郭浩\\安全隐患库.xlsx', "检查后发现：", false)
    .then(function (data) {
        console.log('over');
    }).catch(function (e) {
    console.log(e);
});

/**
 * 获取随机数
 * @param min 最小值
 * @param max 最大值
 */
function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(0);
}

module.exports = service;