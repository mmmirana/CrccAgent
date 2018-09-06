let ExcelUtils = require('../../../_utils/ExcelUtils');
let MysqlUtils = require('../../../_utils/MysqlUtils');
let service = {};

service.readYinhuanProblem = async function (filepath) {
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


                yinhuanProblemItem = Object.assign(yinhuanProblemItem, {
                    node_sid: yinhuanNode.sid,
                    node_id: yinhuanNode.id,
                    node_name: yinhuanNode.danger_longname,
                });

                await MysqlUtils.insert('yinhuan_problem', yinhuanProblemItem);
            }
        }
    }
}

// 将隐患从Excel导入数据库
// service.readYinhuanProblem('F:\\Project\\郭浩\\安全隐患库.xlsx')
//     .then(function (data) {
//         console.log('success');
//     }).catch(function (e) {
//     console.log(e);
// });

async function readUnit() {
    let unitJson = '[{"dangername":"房建","text":"融创项目北区1期12#、13#地块3#楼西段","teamid":null,"checkman":"李富泽","workteam":"山西中铁建筑劳务有限公司","safetyphone":"13653653229","value":101072,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块6#楼西段","teamid":null,"checkman":"廖家全","workteam":"陕西新通达建筑工程有限公司","safetyphone":"18991891105","value":101082,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块4#楼东段","teamid":null,"checkman":"汤国平","workteam":"山西中铁建筑劳务有限公司","safetyphone":"15934133558","value":101076,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块1#楼东段","teamid":null,"checkman":"汤国平","workteam":"山西中铁盛达劳务有限公司","safetyphone":"15934133558","value":101051,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块2#楼东段","teamid":null,"checkman":"汤国平","workteam":"山西中铁建筑劳务有限公司","safetyphone":"15934133558","value":101065,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块5#楼东段","teamid":null,"checkman":"汤国平","workteam":"山西中铁建筑劳务有限公司","safetyphone":"15934133558","value":101078,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块6#楼东段","teamid":null,"checkman":"廖家全","workteam":"陕西新通达建筑工程有限公司","safetyphone":"18991891105","value":101081,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块1#楼西段","teamid":null,"checkman":"汤国平","workteam":"山西中铁盛达劳务有限公司","safetyphone":"15934133558","value":101058,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块5#西段","teamid":null,"checkman":"汤国平","workteam":"山西中铁建筑劳务有限公司","safetyphone":"15934133558","value":101079,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块3#楼东段","teamid":null,"checkman":"李富泽","workteam":"山西中铁建筑劳务有限公司","safetyphone":"13653653229","value":101068,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块2#西段","teamid":null,"checkman":"汤国平","workteam":"山西中铁建筑劳务有限公司","safetyphone":"15934133558","value":101067,"dangerid":"000005"},{"dangername":"房建","text":"融创项目北区1期12#、13#地块4#楼西段","teamid":null,"checkman":"汤国平","workteam":"山西中铁建筑劳务有限公司","safetyphone":"15934133558","value":101077,"dangerid":"000005"}]';
    let unitArr = JSON.parse(unitJson);
    for (let i = 0; i < unitArr.length; i++) {
        let unitItem = unitArr[i];
        let result = await MysqlUtils.insert('yinhuan_unit', unitItem);
        console.log(result);
    }
}

readUnit().then(function (data) {
    console.log('success', data);
}).catch(function (e) {
    console.log(e);
});


module.exports = service;