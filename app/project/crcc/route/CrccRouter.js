const router = require('koa-router')();
const basic_config = require('../model/basic_config');
const basic_unitModel = require('../model/basic_unitModel');
const basic_nodeModel = require('../model/basic_nodeModel');
const basic_problemModel = require('../model/basic_problemModel');
const yinhuan_postdataModel = require('../model/yinhuan_postdataModel');
const yinhuan_logModel = require('../model/yinhuan_logModel');
const ResultUtils = require('../../../_utils/ResultUtils');
const DateUtils = require('../../../_utils/DateUtils');
const FileUtils = require('../../../_utils/FileUtils');

router.prefix('/crcc');

/**
 * 心跳接口
 */
router.get('/Heartbeat', async function (ctx, next) {
    ctx.body = true;
})

router.get('/', async function (ctx, next) {
    ctx.body = 'crcc index';
});

/**
 * 获取配置项
 */
router.post('/getconfig', async function (ctx, next) {
    try {
        let email = ctx.parameters.email;
        if (!email) {
            ctx.body = ResultUtils.errorMsg('缺失参数email');
        } else {
            let where = {
                op_email: email,
                enable: 1,
            };

            let configData = await basic_config.select(where);
            if (configData && configData.length > 0) {
                ctx.body = ResultUtils.successData(configData[0]);
            } else {
                ctx.body = ResultUtils.errorMsg("无法匹配该邮件或该邮件未授权");
            }
        }
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});


/**
 * 获取配置项
 */
router.post('/updateConfigUserid', async function (ctx, next) {
    try {
        let sid = ctx.parameters.sid;
        let guserid = ctx.parameters.guserid;
        if (!sid) {
            ctx.body = ResultUtils.errorMsg('缺失参数sid');
        } else if (!guserid) {
            ctx.body = ResultUtils.errorMsg('缺失参数guserid');
        } else {
            let row = {
                guserid: guserid,
            };
            let updateResult = await basic_config.updateByPk(row, sid);
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
    let textJson = ctx.parameters.textJson;
    if (textJson) {
        try {
            let yinHuanNodes = JSON.parse(textJson);
            await basic_nodeModel.insertYinhuanNodes(yinHuanNodes);

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


module.exports = router;