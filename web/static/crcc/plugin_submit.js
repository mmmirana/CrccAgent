// 要初始化的数据
let genGroupNumber = 0;// 今日已生成的数据
let submitGroupNumber = 0;// 今日已提交的数据

// 登录以后，到达提交页面，获取appid和email
let cp_appid = window.storageutils.get("cp_appid");
let cp_guserid = window.storageutils.get("cp_guserid");

let basicconfig = {};

$().ready(function () {

    basicconfig = initCfg(window.storageutils.get("cp_email"));

    // 是否显示同步数据的按钮
    let showinit = window.storageutils.get('cp_showinit');
    if (showinit === 1) {
        $("#initDiv").show();
    } else {
        $("#initDiv").hide();
    }


    $('#plugin_pop').draggabilly({
        // 选项（配置）...
        containment: true,
        handle: '.handle',
    });

});

//----------------------------------------------
// 一键初始化数据
//----------------------------------------------

/**
 * 一键同步crcc数据
 */
function syncCrccDataOnekey() {
    if (!basicconfig) {
        mdui.alert("抱歉，获取配置信息失败，请确认您的邮箱已授权");
        return;
    }

    // 获取初始化的数目
    let initCrccDataResult = cp_post_sync(cfg.crccBaseUrl + "/crcc/getInitCrccData", {appid: cp_appid});

    if (initCrccDataResult && initCrccDataResult.code === 1) {
        // 单位数量，隐患节点数量，隐患问题数量
        let {unitNum = 0, nodeNum = 0, problemNum = 0} = initCrccDataResult.data;
        // 已经初始化
        if (unitNum > 0 || nodeNum > 0) {
            let reInitInst = mdui.confirm(`已经同步${unitNum}个施工单位，${nodeNum}个隐患节点，${problemNum}个问题，重新初始化“施工单位”和“隐患节点”？`,
                function () {
                    reInitInst.close();
                    // 重新初始化
                    syncCrccData();
                }, null, mduiOpt);
        } else {
            // 直接同步数据
            syncCrccData();
        }
    } else {
        tips(true, getResultErrorMsg(initCrccDataResult));
    }
}

/**
 * 一键初始化数据，生成基础提交数据
 */
function initCrccDataOnekey() {

    // 已生成的提交数据数量
    let initCrccData = cp_post_sync(cfg.crccBaseUrl + "/crcc/getInitCrccData", {appid: cp_appid});
    let {postdatamNum = 0} = initCrccData.data || {};

    if (postdatamNum > 0) {
        // 初始化数据
        let inst = mdui.confirm(`已有${postdatamNum}组基础提交数据，重新初始化？`, function () {
            // 关闭弹窗
            inst.close();

            let clearData = cp_post_sync(cfg.crccBaseUrl + "/crcc/clearBasicPostdata", {appid: cp_appid});
            tips(false, `删除数据结果：${JSON.stringify(clearData)}`);

            /** 过程比较慢，需要loading提示 **/
            let loadingInst = cpLoading("初始化数据", "正在初始化基础提交数据，请耐心等待...");
            setTimeout(function () {
                // 生成的数据
                initBasicPostdata();

                // 执行完成后关闭loading
                loadingInst.close();
            }, 500);

        }, function () {
            // 关闭弹窗
            inst.close();
            // 提示取消提交数据
            tips(true, '[ I ]您取消了初始化数据');
        }, mduiOpt);

    } else {
        /** 过程比较慢，需要loading提示 **/
        let loadingInst = cpLoading("初始化数据", "正在初始化基础提交数据，请耐心等待...");
        setTimeout(function () {
            // 生成的数据
            initBasicPostdata();

            // 执行完成后关闭loading
            loadingInst.close();
        }, 500);
    }
}

/**
 * 调用同步数据的方法
 */
function syncCrccData() {
    if (!basicconfig) {
        mdui.alert("抱歉，获取配置信息失败，请确认您的邮箱已授权");
        return;
    }

    // 1、生成施工单位数据
    syncCrccUnit().then(function (syncResult) {

        if (syncResult && syncResult.code === 1) {

            // 2、生成隐患节点数据
            let dangerids = syncResult.data.dangerids;
            let unitSize = syncResult.data.size;

            tips(true, "[ I ]已同步 " + unitSize + " 个施工单位数据");

            // syncSuccess：是否同步成功，size：总共节点
            let {syncSuccess, size} = syncCrccNodes(dangerids);
            tips(true, '[ I ]已同步 ' + size + ' 个隐患节点数据：' + syncSuccess);


        } else {
            tips(true, "[ E ]同步施工单位数据失败" + getResultErrorMsg(syncResult));
        }
    }).catch(function (e) {
        tips(true, "[ E ]同步数据异常，" + e.toString());
    });


}

/**
 * 初始化单位数据
 * @return {Promise<any>}
 */
function syncCrccUnit() {
    return new Promise(function (resolve, reject) {
        try { // 获取单位数据
            let getUnitUrl = "http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=getUnitByProject";
            let getUnitData = {
                fid: getfid(),
                loginuserid: cp_guserid,
            };

            /**
             * 获取单位成功后，开始同步
             */
            $.when(cp_post(getUnitUrl, getUnitData, "text")).done(function (unitJson) {
                let size = JSON.parse(unitJson).length;
                tips(true, "[ I ]获取施工单位数据成功，准备同步");
                $.when(cp_post(cfg.crccBaseUrl + "/crcc/syncUnit", {
                    appid: cp_appid,
                    unitJson: unitJson
                })).done(function (syncResult) {
                    resolve(syncResult, size);
                });
            });
        } catch (e) {
            reject(e);
        }
    });

}

/**
 * 初始化隐患节点数据
 * @param dangerids
 * @return {{syncSuccess: boolean, size: number}}
 */
function syncCrccNodes(dangerids) {
    let syncSuccess = true;// 同步结果

    tips(true, "[ I ]准备获取隐患节点数据...");

    // 获取隐患节点数据
    let nodeJsonArr = [];
    for (let i = 0; i < dangerids.length; i++) {
        let dangerid = dangerids[i];
        let nodesJson = getNodesByPid(dangerid);
        nodeJsonArr = nodeJsonArr.concat(nodesJson);
    }

    // 分组同步隐患节点数据

    let groupsize = 100;
    tips(true, `[ I ]获取隐患节点数据成功，准备同步（每组${groupsize}）`);
    let nodesArr = groupArrayBySize(nodeJsonArr, groupsize);
    for (let i = 0; i < nodesArr.length; i++) {
        let nodeArr = nodesArr[i];// 第i个100组
        let textJson = JSON.stringify(nodeArr);
        let syncResult = cp_post_sync(cfg.crccBaseUrl + '/crcc/syncNodes', {appid: cp_appid, textJson: textJson});

        let currentSyncResult = (syncResult.code === 1);
        tips(false, `同步第 ${i + 1} 组隐患节点数据：${currentSyncResult ? "成功" : "失败"}`);

        syncSuccess = syncSuccess && currentSyncResult;
    }

    let result = {
        syncSuccess: syncSuccess,
        size: nodeJsonArr.length
    };

    return result;
}

/**
 * 根据上级id获取隐患节点数据
 * @param pid 上级dangerid
 */
function getNodesByPid(pid) {
    let nodeJsonArr = [];
    // 获取隐患名称
    let url = "http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrAddTreeInit&troubleSort=000005&opttype=newline";
    let data = {
        node: pid,
        loginuserid: cp_guserid,
    };

    let childNodes = cp_post_sync(url, data);
    if (childNodes.length > 0) {

        for (let i = 0; i < childNodes.length; i++) {
            let childNode = childNodes[i];
            nodeJsonArr.push(childNode);
            if (childNode.id) {
                nodeJsonArr = nodeJsonArr.concat(getNodesByPid(childNode.id));
            }
        }
    }
    return nodeJsonArr;
}

/**
 * 初始化基础数据
 * @return {*}
 */
function initBasicPostdata() {

    let unitPostDataArr = [];

    // 获取单位列表
    let unitArrData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getAllUnit', {appid: cp_appid});
    let unitArr = unitArrData.data;
    for (let i = 0; i < unitArr.length; i++) {
        let unitItem = unitArr[i];
        let unitText = unitItem.text;// 项目名称
        let unitCheckman = unitItem.checkman;// 检查人
        let unitWorkteam = unitItem.workteam;// 劳务公司
        let unitPhone = unitItem.safetyphone;// 手机
        let unitValue = unitItem.value;// unitvalue

        // 共同的参数，最后加入
        let commonData = {
            opt: 'add',
            batchid: '',
            fid: getfid(),
            unitProject: unitValue,
            unitProjectName: unitText,
            workTeam: unitWorkteam,
            wtCheckMan: unitCheckman,
            safetyphone: unitPhone,
            ttype: 1,
            loginuserid: cp_guserid,
        };

        // 每个单位上传的数据数组
        let unitItemPostData = [];

        let lastNodesData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getLastNodes', {appid: cp_appid});
        let lastNodes = lastNodesData.data;

        for (let j = 0; j < lastNodes.length; j++) {
            // 隐患node节点
            let lastNode = lastNodes[j];

            // 根据隐患节点，获取问题
            let problemsData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getProblemByNodeid', {nodeid: lastNode.id});
            let problems = problemsData.data;

            for (let k = 0; k < problems.length; k++) {
                // 隐患node 对应的问题
                let problem = problems[k];

                // 26个属性
                let dirtyItem = {
                    unitproject: unitText,
                    workteam: unitWorkteam,
                    wtcheckman: unitCheckman,
                    troublescore: lastNode.score,
                    dangerid: lastNode.id,
                    titledesc: lastNode.danger_name,
                    attache_type: 0,
                    rleaf: "0",
                    handleman: unitCheckman,
                    danger_longname: lastNode.danger_longname,
                    type: "1",
                    danger_level: "2",
                    troublename: problem.problem,
                    remark: problem.problem,
                    peoplecount: "2",
                    probability: getRandom(1, 2),
                    belongsort: "3",
                    place: "2",
                    fntech: "1",
                    inoutroad: "2",
                    hasworker: "1",
                    solutions: "1",
                    hasresolvent: cfg.solution[getRandom(0, 1)],
                };

                unitItemPostData.push(dirtyItem);

                tips(false, `进度， 施工单位：${i + 1}/${unitArr.length}, 隐患节点：${j + 1}/${lastNodes.length}, 问题：${k + 1}/${problems.length}`);

            }
        }

        // 打乱每个施工单位下提交数据的所有顺序
        unitItemPostData = window.knuthShuffle(unitItemPostData);
        // 分组
        let unitItemPostDataGroup = groupArrayBySize(unitItemPostData, 20);
        // 放入施工单位最终的数组
        unitPostDataArr.push({
            commonData,
            unitItemPostDataGroup,
        });
    }

    for (let i = 0; i < unitPostDataArr.length; i++) {

        let commonData = unitPostDataArr[i].commonData;
        let unitItemPostDataGroup = unitPostDataArr[i].unitItemPostDataGroup;

        unitItemPostDataGroup.forEach(function (unitItemPostDataGroupItem, index) {
            commonData.dirtydata = JSON.stringify(unitItemPostDataGroupItem);
            let requestData = {
                appid: cp_appid,
                postData: JSON.stringify(commonData),
            };
            let result = cp_post_sync(cfg.crccBaseUrl + '/crcc/uploadBasicPostData', requestData);
            tips(false, `施工单位进度${i + 1}/${unitPostDataArr.length}，生成第${index + 1}组数据结果，` + JSON.stringify(result));
        })
    }

    tips(true, `初始化数据完成，您可以一键提交数据了`);
}


//----------------------------------------------
// 一键提交数据
//----------------------------------------------

/**
 * 一键提交数据
 */
function submitDataOneKey() {

    if (!basicconfig) {
        mdui.alert("抱歉，获取配置信息失败，请确认您的邮箱已授权");
        return;
    }

    // 更新一下数据
    getTodayData();

    // 当前要提交的数据
    let remain = 0;

    // 要提交数据的总组数
    let cp_totalpage = cfg.cp_totalpage;

    // 继续提交
    if (submitGroupNumber >= cp_totalpage) {
        let inst = mdui.prompt('每日计划提交 ' + cp_totalpage + ' 组数据，今日已提交 ' + submitGroupNumber + ' 组数据，再次提交多少组数据（请输入正整数）？',
            function (remain) {
                inst.close();

                remain = parseInt(remain);
                if (isNaN(remain) || remain === 0) {
                    tips(true, "[ I ]操作自动取消，请输入正整数后重试");
                } else {
                    tips(true, '[ I ]正在继续提交 ' + remain + ' 数据，请稍后...');

                    submitData(remain);
                }
            }, function () {
                inst.close();
            }, mduiOpt);
    } else {
        remain = cp_totalpage - submitGroupNumber;
        tips(true, '[ I ]继续提交 ' + remain + ' 组数组');
        // 继续提交
        submitData(remain);
    }
}

// 获取今日生成和已提交数据数量
function getTodayData() {
    let somedayDataResult = cp_post_sync(cfg.crccBaseUrl + '/crcc/getSomedayData', {
        "appid": cp_appid,
        "date": dateutils.format(new Date(), 'yyyy-MM-dd')
    });
    if ((somedayDataResult.code || 0) === 1) {
        // 今日已提交数据
        genGroupNumber = somedayDataResult.data.genNumber;
        submitGroupNumber = somedayDataResult.data.submitNumber;
    } else {
        tips(true, '[ E ]获取今日数据异常：' + getResultErrorMsg(somedayDataResult));
    }
}


let submitLoading = null;

/**
 * 生成数据并提交数据
 */
function submitData(remain) {

    // 准备提交
    let inst = mdui.confirm(`一键提交 ${remain} 组数据？`, function () {
        // 关闭弹窗
        inst.close();

        submitLoading = cpLoading("提交数据中", "正在提交数据中，请稍后");
        setTimeout(function () {
            // 生成数据
            let postdataResult = generateTodayData(remain);
            let postdataArr = postdataResult.data;

            // 开始提交
            let post_index = 0;
            tips(true, '[ I ]获取到：' + postdataArr.length + ' 组数据，准备提交...');

            // 循环遍历，提交单条数据
            submitSingleData(postdataArr, post_index);
        }, 500)

    }, function () {
        // 关闭弹窗
        inst.close();
        // 提示取消提交数据
        tips(true, '[ I ]您取消了提交数据');
    }, mduiOpt);
}


/**
 * 遍历提交单条数据
 */
function submitSingleData(postdataArr, post_index) {

    if (post_index < postdataArr.length) {
        tips(true, '[ I ]正在提交数据 ' + (post_index + 1) + '/' + postdataArr.length);
        // 要遍历提交的数据
        let postdataItem = postdataArr[post_index];

        let postdataObj_sid = postdataItem.sid;
        let postdataObj_data = JSON.parse(postdataItem.postdata);

        // 2 直接提交
        submitUploadDataNow(postdataObj_data, function () {

            let updateReturn = cp_post_sync(cfg.crccBaseUrl + '/crcc/postdataSuccess', {
                postdata_sid: postdataObj_sid,
                postdata_status: 1
            });
            if (updateReturn && updateReturn.code === 1) {
                tips(false, '[ I ]更新插件服务器数据成功');
            } else {
                tips(true, '[ I ]更新插件服务器数据失败：' + updateReturn ? updateReturn.msg : '服务器错误');
            }

            // 提交数据成功，继续下次提交
            let $img = $(window.frames[0].document).find("#randSaveImg");
            $img.click();
            setTimeout(function () {
                submitSingleData(postdataArr, ++post_index);
            }, 500);
        });
    } else {
        if (submitLoading) {
            submitLoading.close();
        }
        tips(true, '[ I ]提交数据完毕，可以一键消除隐患了...');
    }
}

/**
 * 直接提交数据
 */
function submitUploadDataNow(postdataObj_data, cb) {

    let $img = $(window.frames[0].document).find("#randSaveImg");
    let validateCode = resolveCode($img)
    if (validateCode && validateCode.length === 4) {
        let validateValcodeData = {
            data: postdataObj_data.dirtydata,
            verifycode: validateCode,
            ttype: "1",
            loginuserid: cp_guserid,
        };
        // 1、校验验证码
        let cp_validateReturn = cp_post_sync("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=validateEditGridAttacheType", validateValcodeData);
        if (cp_validateReturn && cp_validateReturn.success) {
            // # 提交结果
            let submitTableData = {
                hasCheckPerson: true,
                userids: "aa",
                opt: "add",
                batchid: "",
                fid: getfid(),
                dirtydata: postdataObj_data.dirtydata,
                unitProject: postdataObj_data.unitProject,
                ttype: 1,
                unitProjectName: postdataObj_data.unitProjectName,
                workTeam: postdataObj_data.workTeam,
                wtCheckMan: postdataObj_data.wtCheckMan,
                safetyphone: postdataObj_data.safetyphone,
                verifycode: validateCode,
                loginuserid: cp_guserid,
            };

            // 2、开始提交
            let cp_submitReturn = cp_post_sync("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubleSubmitExamine", submitTableData);

            // 保存成功
            if (cp_submitReturn && cp_submitReturn.success) {
                tips(true, '[ I ]提交数据成功');
                cb();
            } else {
                $img.click();
                setTimeout(function () {
                    submitUploadDataNow(postdataObj_data, cb);
                }, 500);
            }
        } else {
            $img.click();
            setTimeout(function () {
                submitUploadDataNow(postdataObj_data, cb);
            }, 500);
        }
    } else {
        $img.click();
        setTimeout(function () {
            submitUploadDataNow(postdataObj_data, cb);
        }, 500);
    }
}

/**
 * 生成今日数据的具体方法
 * @param remain 当前要生成的数量
 * @return number 当前方法生成数据的组数
 */
function generateTodayData(remain) {

    // 获取单位列表
    let unitArrData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getAllUnit', {appid: cp_appid});
    let unitArr = unitArrData.data;

    let notinUnitValueArr = [];

    for (let i = 0; i < unitArr.length; i++) {
        let unitItem = unitArr[i];
        let unitValue = unitItem.value;// unitvalue

        // 开始校验单位
        let checkdata = {
            fid: getfid(),
            unitProjectid: unitValue,
            ttype: "1",
            loginuserid: cp_guserid,
        };
        // 校验单位
        let checkunitData = cp_post_sync('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=verificationUnitProejct', checkdata);
        if (checkunitData && checkunitData.result === true) {
        } else {
            notinUnitValueArr.push(unitValue);
        }
    }

    let genReqData = {
        appid: cp_appid,// appid
        notinUnitValueJson: JSON.stringify(notinUnitValueArr),// 不包含的单位value
        number: remain,// 要生成的条数
    };
    let getPostdataResult = cp_post_sync(cfg.crccBaseUrl + '/crcc/genTodaySubmitData', genReqData);

    return getPostdataResult;
}


/**
 * 获取fid
 * @returns {*}
 */
function getfid() {
    return window.frames[0]._fid;
}
