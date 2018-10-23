const router = require('koa-router')();
const basic_authModel = require('../model/basic_authModel');
const basic_configModel = require('../model/basic_configModel');
const basic_unitModel = require('../model/basic_unitModel');
const basic_nodeModel = require('../model/basic_nodeModel');
const basic_problemModel = require('../model/basic_problemModel');
const basic_postdataModel = require('../model/basic_postdataModel');
const yinhuan_postdataModel = require('../model/yinhuan_postdataModel');
const yinhuan_rmdangerModel = require('../model/yinhuan_rmdangerModel');
const ResultUtils = require('../../../_utils/ResultUtils');
const DateUtils = require('../../../_utils/DateUtils');

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
                let showinit = auth.showinit || 0;// 是否显示初始化按钮
                if (auth.enable === 0) {
                    result = ResultUtils.errorMsg('该邮箱尚未授权');
                } else {
                    let configData = await basic_configModel.select({appid: auth.appid, enable: 1});
                    if (configData && configData.length > 0) {
                        let config = configData[0];
                        config.showinit = showinit;
                        result = ResultUtils.successData(config);
                    } else {
                        result = ResultUtils.errorMsg('该邮箱的应用尚未配置或尚未启用');
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
 * @deprecated 使用syncNodes方法同步隐患节点
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
 * 上传隐患节点数据
 */
router.post('/syncNodes', async function (ctx, next) {
    let appid = ctx.parameters.appid;
    let textJson = ctx.parameters.textJson;
    if (textJson) {
        try {
            let yinHuanNodes = JSON.parse(textJson);
            await basic_nodeModel.syncNodes(appid, yinHuanNodes);

            ctx.body = ResultUtils.successMsg('同步隐患节点成功');
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
        let appid = ctx.parameters.appid;
        let data = await basic_unitModel.select({appid: appid});
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

        let appid = ctx.parameters.appid;

        let sql = `SELECT
	* 
FROM
	basic_nodes t 
WHERE
	1 = 1 
	AND t.appid = ?
	AND LEFT ( t.id, 12 ) != '000005000001' 
	AND LENGTH( t.id ) = ? `;
        let params = [appid, 24];

        let data = await basic_nodeModel.query(sql, params);
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
        let appid = ctx.parameters.appid;
        let nodeid = ctx.parameters.nodeid;
        let data = await basic_problemModel.select({"appid": appid, "node_id": nodeid});
        ctx.body = ResultUtils.successData(data);
    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});

/**
 * 上传某appid下的基础提交数据，开始初始化之前，一定要清除某APPID的数据
 */
router.post('/uploadBasicPostData', async function (ctx, next) {
    try {

        let postDataModel = {};
        postDataModel.appid = ctx.parameters.appid;// appid

        postDataModel.data = ctx.parameters.postData || "[]";// 要提交的数据JSON
        postDataModel.create_time = new Date();// 创建时间

        let result = await basic_postdataModel.insert(postDataModel);
        ctx.body = ResultUtils.successData(result.affectedRows);

    } catch (e) {
        ctx.body = ResultUtils.errorMsg(e.toString());
    }
});

/**
 * 随机获取几条记录
 * @deprecated 不再每天生成所有数据后再 获取随机数据，调整为genTodaySubmitData
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
        let appid = ctx.parameters.appid;
        let ymd = ctx.parameters.ymd || DateUtils.format(new Date, "yyyy-MM-dd");

        let data = {genNumber, submitNumber} = await yinhuan_postdataModel.getSomedayData(appid, ymd);

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
                console.log("同步消除隐患数据结果，" + JSON.stringify(insertResult));
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

/**
 * 同步施工单位
 */
router.post('/syncUnit', async function (ctx) {
    try {
        let appid = ctx.parameters.appid;
        let unitJson = ctx.parameters.unitJson;

        let dangerids = [];

        let unitArr = JSON.parse(unitJson);
        for (let i = 0; i < unitArr.length; i++) {
            let unitItem = unitArr[i];
            unitItem.appid = appid;
            let findWhere = {
                appid: appid,
                value: unitItem.value,
            };
            let count = await basic_unitModel.count(findWhere);
            let result = {};
            if (count === 0) {
                result = await basic_unitModel.insert(unitItem);
            } else {
                result = await basic_unitModel.update(unitItem, findWhere);
            }
            console.log("同步第" + (i + 1) + "条施工单位数据：" + JSON.stringify(result));

            // 将dangerid放入dangerids
            let dangerid = unitItem.dangerid;
            if (dangerid && dangerids.indexOf(dangerid) === -1) {
                dangerids.push(dangerid);
            }
        }
        ctx.body = ResultUtils.success({"dangerids": dangerids, "size": unitArr.length}, "同步施工单位数据成功");
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("同步施工单位数据异常" + e.toString());
    }
});

/**
 * 获取初始化的数据条目数
 */
router.post('/getInitCrccData', async function (ctx) {
    try {
        let appid = ctx.parameters.appid;
        let where = {
            appid: appid
        };
        let unitNum = await basic_unitModel.count(where);
        let nodeNum = await basic_nodeModel.count(where);
        let problemNum = await basic_problemModel.count(where);
        let postdatamNum = await basic_postdataModel.count(where);

        let initData = {
            unitNum,// 单位数量
            nodeNum,// 隐患节点数量
            problemNum,// 隐患问题数量
            postdatamNum,// 提交数据数量
        };

        ctx.body = ResultUtils.success(initData, "获取初始化数据条目成功");
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("获取初始化数据条目异常，" + e.toString());
    }
});

/**
 * 获取初始化的数据条目数
 */
router.post('/clearBasicPostdata', async function (ctx) {
    try {
        let appid = ctx.parameters.appid;
        let where = {
            appid: appid
        };
        let dbresult = await basic_postdataModel.delete(where);

        ctx.body = ResultUtils.success(dbresult.affectedRows, "删除成功");
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("获取初始化数据条目异常，" + e.toString());
    }
});


/**
 * 生成今日要提交的数据
 */
router.post("/genTodaySubmitData", async function (ctx) {
    try {
        let appid = ctx.parameters.appid;
        let number = ctx.parameters.number || 0;
        number = number * 1;
        let notinUnitValueJson = ctx.parameters.notinUnitValueJson || "[]";

        let notinUnitValueArr = JSON.parse(notinUnitValueJson);

        let nowDate = new Date();// 今天
        let nowDateStr = DateUtils.format(nowDate, 'yyyy-MM-dd');

        let basicConfigData = await basic_configModel.selectOne({appid: appid, enable: 1});
        let cycleDay = (basicConfigData.cp_cycle_day || 7) * 1;
        let lastCycleDate = nowDate;// 上周期的最后一天
        lastCycleDate.setDate(lastCycleDate.getDate() - cycleDay)
        let lastCycleDateStr = DateUtils.format(lastCycleDate, 'yyyy-MM-dd');

        // 查询当天已有的postdatasid
        let havePostIdsSql = `SELECT DISTINCT
        ( t.postdatasid ) 
    FROM
        yinhuan_postdata t 
    WHERE
        1 = 1 
        AND t.appid = ?
        AND t.posttime <= ?
        AND t.posttime > ?`;

        let havePostIdsParams = [appid, nowDateStr, lastCycleDateStr];

        let postSidsResult = await yinhuan_postdataModel.query(havePostIdsSql, havePostIdsParams);
        let postSids = postSidsResult.map(function (v) {
            return v.postdatasid;
        });

        // 随机选择的basic_postdata
        let pickPostdataSql = `SELECT
        t.* 
    FROM
        basic_postdata t 
    WHERE
        1 = 1 
        AND t.appid = ? `;
        let pickPostdataParams = [];
        pickPostdataParams.push(appid);

        if (notinUnitValueArr.length > 0) {
            pickPostdataSql += ` AND t.unitcode NOT IN ( ? )`;
            pickPostdataParams.push(notinUnitValueArr);
        }
        if (postSidsResult.length > 0) {
            pickPostdataSql += ` AND t.sid NOT IN ( ? ) `;
            pickPostdataParams.push(postSids);
        }
        pickPostdataSql += `ORDER BY RAND() LIMIT ?`;
        pickPostdataParams.push(number);

        let dbResult = await yinhuan_postdataModel.query(pickPostdataSql, pickPostdataParams);

        // 遍历，入库yinhuan_postdata
        for (let i = 0; i < dbResult.length; i++) {
            // 重置data
            let basic_postdataRow = dbResult[i];
            let basic_postdataRow_dataJson = basic_postdataRow.data;
            let basic_postdataRow_dataObj = JSON.parse(basic_postdataRow_dataJson);
            let dirtydataJson = basic_postdataRow_dataObj.dirtydata;
            let dirtydataObj = JSON.parse(dirtydataJson);

            let dirtydataArr = [];
            for (let j = 0; j < dirtydataObj.length; j++) {
                let item = dirtydataObj[j];
                item.discoverydate = nowDateStr;
                item.handledate = nowDateStr + "T00:00:00";
                item.flgid = j + 1;
                dirtydataArr.push(item);
            }

            let postdata_data = Object.assign(basic_postdataRow_dataObj, {
                dirtydata: JSON.stringify(dirtydataArr)
            });

            let where = {
                appid: appid,
                postdatasid: basic_postdataRow.sid,
                posttime: nowDateStr,
            };

            // 要新增的rowuploadDangerlist
            let postdataRow = Object.assign(where, {
                postdata: JSON.stringify(postdata_data),
            });

            let count = await yinhuan_postdataModel.count(where);
            let dbresult = {};
            if (count === 0) {
                dbresult = await yinhuan_postdataModel.insert(postdataRow);
            } else {
                dbresult = await yinhuan_postdataModel.update(postdataRow, where);
            }
            console.log(`basic_postdata[ ${basic_postdataRow.sid} ] ==> yinhuan_postdata ` + JSON.stringify(dbresult))
        }

        let postdataRowList = await yinhuan_postdataModel.select({
            appid: appid,
            posttime: nowDateStr,
            status: 0,
        });
        ctx.body = ResultUtils.success(postdataRowList, "生成提交数据成功");
    } catch (e) {
        ctx.body = ResultUtils.errorMsg("生成提交数据异常，" + e.toString());
    }
});


module.exports = router;
