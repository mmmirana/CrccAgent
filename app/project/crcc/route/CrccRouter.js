const router = require('koa-router')();
const basic_authModel = require('../model/basic_authModel');
const basic_configModel = require('../model/basic_configModel');
const basic_unitModel = require('../model/basic_unitModel');
const basic_nodeModel = require('../model/basic_nodeModel');
const basic_problemModel = require('../model/basic_problemModel');
const yinhuan_postdataModel = require('../model/yinhuan_postdataModel');
const yinhuan_rmdangerModel = require('../model/yinhuan_rmdangerModel');
const ResultUtils = require('../../../_utils/ResultUtils');
const DateUtils = require('../../../_utils/DateUtils');
const FileUtils = require('../../../_utils/FileUtils');

router.prefix('/crcc');

router.get('/', async function (ctx, next) {
    ctx.body = 'crcc index';
});

/**
 * 心跳接口
 */
router.get('/Heartbeat', async function (ctx, next) {
    ctx.body = true;
})


/**
 * 根据邮箱获取配置项
 */
router.post('/getconfig', async function (ctx, next) {
    let result = "";
    try {
        let email = ctx.parameters.email;
        if (!email) {
            result = ResultUtils.errorMsg('缺失参数email');
        } else {
            let where = {
                email: email,
            };
            // 根据邮箱查找授权appid
            let authData = await basic_authModel.select(where);
            if (authData && authData.length > 0) {
                let auth = authData[0];
                if (auth.enable === 0) {
                    result = ResultUtils.errorMsg('该邮箱尚未授权');
                } else {
                    let configData = await basic_configModel.select({appid: auth.appid});
                    if (configData && configData.length > 0) {
                        let config = configData[0];
                        if (config.enable === 0) {
                            result = ResultUtils.errorMsg('该邮箱的应用未启用');
                        } else {
                            result = ResultUtils.successData(config);
                        }
                    } else {
                        result = ResultUtils.errorMsg('该邮箱的应用尚未配置');
                    }
                }
            } else {
                result = ResultUtils.errorMsg('无法匹配该邮箱');
            }
        }
    } catch (e) {
        result = ResultUtils.errorMsg(e.toString());
    }
    ctx.body = result;
});


/**
 * 获取配置项
 */
router.post('/updateConfigUserid', async function (ctx, next) {
    try {
        let appid = ctx.parameters.appid;
        let guserid = ctx.parameters.guserid;
        if (!appid) {
            ctx.body = ResultUtils.errorMsg('缺失参数appid');
        } else if (!guserid) {
            ctx.body = ResultUtils.errorMsg('缺失参数guserid');
        } else {
            let row = {
                guserid: guserid,
            };
            let updateResult = await basic_configModel.update(row, {appid: appid, enable: 1});
            ctx.body = ResultUtils.successData(updateResult);
        }
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});

/**
 * 更新隐患节点数据
 */
router.post('/updateYinhuanNodes', async function (ctx, next) {
    let appid = ctx.parameters.appid;
    let textJson = ctx.parameters.textJson;
    if (textJson) {
        try {
            let yinHuanNodes = JSON.parse(textJson);
            await basic_nodeModel.insertYinhuanNodes(appid, yinHuanNodes);

            ctx.body = ResultUtils.successMsg('上传成功');
        } catch (e) {
            ctx.body = ResultUtils.errorMsg(e.toString());
        }

    } else {
        ctx.body = ResultUtils.errorMsg('缺失参数textJson');
    }
});

/**
 * 获取所有的单位
 */
router.post('/getAllUnit', async function (ctx, next) {
    try {
        let data = await basic_unitModel.select();
        ctx.body = ResultUtils.successData(data);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
})

/**
 * 获取所有隐患的叶子节点，除了管理之外的
 */
router.post('/getLastNodes', async function (ctx, next) {
    try {
        let data = await basic_nodeModel.query(`SELECT
	* 
FROM
	basic_nodes t 
WHERE
	1 = 1 
	AND LEFT ( t.id, 12 ) != '000005000001' 
	AND LENGTH( t.id ) = 24`, []);
        ctx.body = ResultUtils.successData(data);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});


/**
 * 获取某隐患对应的 问题名称列表
 */
router.post('/getProblemByNodeid', async function (ctx, next) {
    try {
        let nodeid = ctx.parameters.nodeid;
        let data = await basic_problemModel.select({"node_id": nodeid});
        ctx.body = ResultUtils.successData(data);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});

/**
 * 上传今日某隐患对应的 问题名称列表
 */
router.post('/uploadPostData', async function (ctx, next) {
    try {

        let postDataModel = {};
        postDataModel.appid = ctx.parameters.appid;// appid

        postDataModel.unitcode = ctx.parameters.unitcode;
        postDataModel.nodecode = ctx.parameters.nodecode;
        postDataModel.problemcode = ctx.parameters.problemcode;

        postDataModel.data = ctx.parameters.postData || "[]";// 要提交的数据JSON
        postDataModel.create_time = new Date();// 创建时间

        // 获取单位信息
        let unitData = await basic_unitModel.select({value: postDataModel.unitcode});
        if (unitData.length > 0) {
            postDataModel.unitname = unitData[0].text;
        }
        // 获取隐患节点信息 // 获取问题信息
        let problemData = await basic_problemModel.select({
            node_id: postDataModel.nodecode,
            index: postDataModel.problemcode
        });
        if (problemData.length > 0) {
            postDataModel.nodename = problemData[0].node_name;
            postDataModel.problemname = problemData[0].problem;
        }

        // 1、先查找当前是否有数据
        let countSql = `SELECT
	count( 1 ) AS count 
FROM
	yinhuan_postdata t 
WHERE
	1 = 1 
	AND t.unitcode =? 
	AND t.nodecode =? 
	AND t.problemcode =? 
	AND DATE_FORMAT( t.create_time, '%Y-%m-%d' ) = ?`;
        let countParams = [];
        countParams.push(postDataModel.unitcode);
        countParams.push(postDataModel.nodecode);
        countParams.push(postDataModel.problemcode);
        countParams.push(DateUtils.format(new Date(), 'yyyy-MM-dd'));

        let countData = await yinhuan_postdataModel.query(countSql, countParams);

        // 没有数据插入
        if (countData[0].count === 0) {
            let result = await yinhuan_postdataModel.insert(postDataModel);
            ctx.body = ResultUtils.successData(result.affectedRows);
        } else {
            ctx.body = ResultUtils.successData("已有数据，不再新增");
        }


    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});

/**
 * 随机获取几条记录
 */
router.post('/getRandomPostData', async function (ctx, next) {
    try {
        let itemNumber = ctx.parameters.itemNumber || 10;
        itemNumber = itemNumber * 1;
        let date = ctx.parameters.date || DateUtils.format(new Date(), 'yyyy-MM-dd');
        let randomPostData = await yinhuan_postdataModel.queryRandomPostData(itemNumber, date);
        ctx.body = ResultUtils.successData(randomPostData);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
})

/**
 * 获取某天上传的条目数量
 */
router.post('/getSomedayData', async function (ctx, next) {
    try {
        let ymd = ctx.parameters.ymd || DateUtils.format(new Date, "yyyy-MM-dd");

        let data = {genNumber, submitNumber} = await yinhuan_postdataModel.getSomedayData(ymd);

        ctx.body = ResultUtils.successData(data);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
})

/**
 * 更新提交数据 状态 1：保存成功；3：提交成功
 */
router.post('/postdataSuccess', async function (ctx, next) {
    try {
        let postdata_sid = ctx.parameters.postdata_sid;
        let postdata_status = ctx.parameters.postdata_status;

        let updateResult = await yinhuan_postdataModel.updateByPk({status: postdata_status}, postdata_sid);
        ctx.body = ResultUtils.successData(updateResult.affectedRows);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});

/**
 * 上传消除隐患的数据
 */
router.post('/uploadDangerlist', async function (ctx) {
    try {
        let appid = ctx.parameters.appid;
        let dangerlistJson = ctx.parameters.dangerlistJson;
        let dangerlist = JSON.parse(dangerlistJson);
        // 遍历数据
        for (let i = 0; i < dangerlist.length; i++) {
            let danger = dangerlist[i];

            let dangerModel = {
                appid: appid,
                username: danger.username,
                userid: danger.userid,
                project_unit_name: danger.project_unit_name,
                funit: danger.funit,
                fprojecttypename: danger.fprojecttypename,
                fprojectname: danger.fprojectname,
                check_man: danger.check_man,
                home_score: danger.home_score,
                status: danger.status,
                danger_longname: danger.danger_longname,
                dangerid: danger.dangerid,
                dangerdesc: danger.dangerdesc,
                check_time: danger.check_time,
                unitdeptname: danger.unitdeptname,
                create_time: danger.create_time,
                titledesc: danger.titledesc,
                cp_troubleid: danger.cp_troubleid,
                troublename: danger.troublename,
            };

            let count = await yinhuan_rmdangerModel.count(dangerModel);
            if (count === 0) {
                let insertResult = await yinhuan_rmdangerModel.insert(dangerModel);
                console.log(insertResult);
            }
        }
        ctx.body = ResultUtils.successMsg("上传成功");
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("解析消除隐患列表异常" + e.toString());
    }
});

/**
 * 获取某天要消除的隐患列表
 */
router.post('/getdangerlist', async function (ctx) {
    try {
        let someday = ctx.parameters.someday;
        let where = {
            sstatus: 0,//查询尚未消除的隐患
        };
        // 如果有值，查询某天的数据。没值查询所有
        if (someday) {
            where.check_time = someday;
        }
        let result = await yinhuan_rmdangerModel.select(where);
        ctx.body = ResultUtils.successData(result);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("获取消除隐患列表异常" + e.toString());
    }
});

/**
 * 消除隐患成功，更新状态
 */
router.post('/rmdangerBySid', async function (ctx) {
    try {
        let sid = ctx.parameters.sid;
        let sstatus = ctx.parameters.sstatus;
        let dataid = ctx.parameters.dataid;

        let row = {
            sstatus: sstatus,
            dataid: dataid,
        };
        let result = await yinhuan_rmdangerModel.updateByPk(row, sid);
        ctx.body = ResultUtils.successData(result);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("获取消除隐患列表异常" + e.toString());
    }
});


module.exports = router;