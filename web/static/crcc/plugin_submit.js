// 要初始化的数据
let unitArr = [];// 获取所有的施工单位
let genGroupNumber = 0;// 今日已生成的数据
let submitGroupNumber = 0;// 今日已提交的数据

// 登录以后，到达提交页面，获取appid和email
let appid = storageutils.get("cp_appid");
let email = storageutils.get("cp_email");

$().ready(function () {
    var $draggable = $('#plugin_pop').draggabilly({
        // 选项（配置）...
        containment: true,
        handle: '.handle',
    });

    initCfg(email);

    // 获取单位列表
    cp_post(cfg.crccBaseUrl + '/crcc/getAllUnit')
        .done(function (unitArrData) {
            if (unitArrData && unitArrData.code === 1) {
                unitArr = unitArrData.data;
            } else {
                tips(true, '[ E ]插件服务器异常：' + JSON.stringify(unitArrData));
            }
        });

});

/**
 * 一键提交数据
 */
function submitDataOneKey() {

    // 生成数据
    generateTodayData(function (nextStep) {

        // 生成数据正常，进行后续操作
        if (nextStep) {

            // 提交数据，参数remain为要提交的组数
            submitData(function (remain) {
                let inst = mdui.confirm(`一键提交 ${remain} 组数据？`, function () {
                    // 关闭弹窗
                    inst.close();

                    let postdataData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getRandomPostData', {itemNumber: remain});
                    if ((postdataData.code || 0) === 1) {
                        let postdataArr = postdataData.data;
                        let post_index = 0;

                        tips(true, '[ I ]获取到：' + postdataArr.length + ' 组数据，准备提交...');
                        submitSingleData(postdataArr, post_index);
                    }

                }, function () {
                    // 关闭弹窗
                    inst.close();
                    // 提示取消提交数据
                    tips(true, '[ I ]您取消了提交数据');
                }, {
                    confirmText: '确定',
                    cancelText: '取消',
                });
            });

        } else {
            tips(true, "[ E ]插件服务器生成数据时异常，请重试");
        }
    });

}

// 获取今日提交数据
function initTodayData() {
    return new Promise(function (resolve, reject) {
        cp_post(cfg.crccBaseUrl + '/crcc/getSomedayData', {"date": dateutils.format(new Date(), 'yyyy-MM-dd')})
            .done(function (getSomedayDataResult) {
                if ((getSomedayDataResult.code || 0) === 1) {
                    // 今日已提交数据
                    genGroupNumber = getSomedayDataResult.data.genNumber;
                    submitGroupNumber = getSomedayDataResult.data.submitNumber;
                    resolve(true);
                } else {
                    tips(true, '[ E ]插件服务器异常：' + JSON.stringify(getSomedayDataResult));
                    resolve(false);
                }
            });
    });
}

/**
 * 将节点同步至本地服务器
 */
function syncYinhuanNodes() {
    let syncSuccess = syncYinhuanNodesByNodes();
    tips(true, '[ I ]同步隐患节点数据到插件服务器完成, syncSuccess：' + syncSuccess);
}

/**
 * 将节点同步至本地服务器
 */
function syncYinhuanNodesByNodes(pid) {

    let syncSuccess = 1;// 默认同步成功

    // 获取隐患名称
    let url = "http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrAddTreeInit&troubleSort=000005&opttype=newline";
    let data = {
        node: pid,
        loginuserid: '10426838',
    };

    let childNodes = cp_post_sync(url, data);
    if (childNodes.length > 0) {
        // 上传至本地服务器
        let uploadresult = uploadYinhuanNodes(JSON.stringify(childNodes));
        // 上传成功
        if ((uploadresult.code || 0) === 1) {
            for (let j = 0; j < childNodes.length; j++) {
                let childNode = childNodes[j];
                if (childNode.id) {
                    let data = syncYinhuanNodesByNodes(childNode.id);
                    syncSuccess *= data;
                }
            }
        }
    }
    return syncSuccess;
}

/**
 * 上传至服务器
 * @param textJson
 * @returns {Promise<any>}
 */
function uploadYinhuanNodes(textJson) {
    return cp_post_sync(cfg.crccBaseUrl + '/crcc/updateYinhuanNodes', {appid: appid, textJson: textJson});
}

/**
 * 校验并提交数据
 */
function submitData(cb) {

    initTodayData().then(function (initFlag) {
        if (initFlag === false) {
            return;
        }

        // 当前要提交的数据
        let remain = 0;

        // 要提交数据的总组数
        let cp_totalpage = cfg.cp_totalpage;
        if (submitGroupNumber >= cp_totalpage) {
            let inst = mdui.prompt('每日计划提交 ' + cp_totalpage + ' 组数据，今日已提交 ' + submitGroupNumber + ' 组数据，再次提交多少组数据（请输入正整数）？',
                function (remain) {
                    inst.close();

                    remain = parseInt(remain);
                    if (isNaN(remain) || remain === 0) {
                        tips(true, "[ I ]操作自动取消，请输入正整数后重试");
                    } else {
                        tips(true, '[ I ]正在继续提交 ' + remain + ' 数据，请稍后...');
                        // 继续提交
                        cb(remain);
                    }
                }, function () {
                    inst.close();
                }, {
                    confirmText: '确定',
                    cancelText: '取消',
                });
        } else {
            remain = cp_totalpage - submitGroupNumber;
            tips(true, '[ I ]继续提交剩余 ' + remain + ' 组数组');
            // 继续提交
            cb(remain);
        }
    });
}


/**
 * 遍历提交单条数据
 */
function submitSingleData(postdataArr, post_index) {

    if (post_index < postdataArr.length) {
        tips(true, '[ I ]正在提交数据 ' + (post_index + 1) + '/' + postdataArr.length);
        // 要遍历提交的数据
        let postdata = postdataArr[post_index];

        let postdataObj_sid = postdata.sid;
        let postdataObj_data = JSON.parse(postdata.data);

        // 2 直接提交
        submitUploadDataNow(postdataObj_data, function () {

            let updateReturn = cp_post_sync(cfg.crccBaseUrl + '/crcc/postdataSuccess', {
                postdata_sid: postdataObj_sid,
                postdata_status: 3
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
            loginuserid: storageutils.get("cp_guserid"),
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
                loginuserid: storageutils.get("cp_guserid"),
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
 * 生成今日要提交的数据
 * @param cb 参数nextStep 如果nextStep则可以进行后续操作，否则取消
 */
function generateTodayData(cb) {

    // 获取今日数据，如果获取失败，告知不要进行后续操作
    initTodayData().then(function (initFlag) {
        if (initFlag === false) {
            cb(false);
        } else {
            // 已经生成过了，确定是否继续生成
            if (genGroupNumber > 0) {

                // 不再生成，告知可以继续
                cb(true);

            } else {
                tips(true, "[ I ]正在为您生成数据，请稍后...");
                let loadingInst = cpLoading('准备提交数据', '正在准备要提交数据，请稍后...');
                let genGroupNumAlreay = generateTodayDataFn();
                loadingInst.close();
                tips(true, '[ I ]生成数据完毕, 共生成' + genGroupNumAlreay + '组数据');

                cb(true);
            }
        }
    });
}

/**
 * 生成今日数据的具体方法
 * @return genGroupNumAlreay 当前方法生成数据的组数
 */
function generateTodayDataFn() {

    let genGroupNumAlreay = 0;// 调用本方法生成数据的组数

    let dirtyDataTempArr = [];

    for (let i = 0; i < unitArr.length; i++) {

        let unitItem = unitArr[i];
        let unitText = unitItem.text;// 项目名称
        let unitCheckman = unitItem.checkman;// 检查人
        let unitWorkteam = unitItem.workteam;// 劳务公司
        let unitPhone = unitItem.safetyphone;// 手机
        let unitValue = unitItem.value;// unitvalue

        // 开始校验单位
        let checkdata = {
            fid: getfid(),
            unitProjectid: unitValue,
            ttype: "1",
            loginuserid: storageutils.get("cp_guserid"),
        };
        let checkunitData = cp_post_sync('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=verificationUnitProejct', checkdata);
        if (!checkunitData || !checkunitData.result === true) {
            tips(false, 'check unit：' + '校验单位是否可以生成数据' + unitItem.text);
            continue;
        }

        tips(false, '---1 ' + '正在准备单位数据：' + unitItem.text);

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
            loginuserid: storageutils.get("cp_guserid"),
        };

        let lastNodesData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getLastNodes');
        if ((lastNodesData.code || 0) === 1) {
            let lastNodes = lastNodesData.data;
            for (let k = 0; k < lastNodes.length; k++) {

                // 隐患node节点
                let lastNode = lastNodes[k];

                tips(false, '---2 ' + '正在准备隐患节点数据：' + lastNode.danger_name);

                let problemsData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getProblemByNodeid', {nodeid: lastNode.id});
                if ((problemsData.code || 0) === 1) {
                    let problems = problemsData.data;

                    for (let l = 0; l < problems.length; l++) {


                        // 隐患node 对应的问题
                        let problem = problems[l];

                        tips(false, '---3 ' + '正在准备隐患问题数据：' + problem.problem);

                        // 16个属性
                        let dirtyItem = {
                            unitproject: unitText,
                            workteam: unitWorkteam,
                            wtcheckman: unitCheckman,
                            troublescore: lastNode.score,
                            dangerid: lastNode.id,
                            titledesc: lastNode.danger_name,
                            discoverydate: dateutils.format(new Date(), 'yyyy-MM-dd'),
                            attache_type: 0,
                            rleaf: "0",
                            handleman: unitCheckman,
                            danger_longname: lastNode.danger_longname,
                            flgid: dirtyDataTempArr.length + 1,
                            type: 1,
                            danger_level: "2",
                            troublename: problem.problem,
                            remark: problem.problem,
                            peoplecount: 2,
                            probability: getRandom(1, 2),
                            belongsort: "3",
                            place: "2",
                            fntech: "1",
                            inoutroad: "2",
                            hasworker: "1",
                            solutions: "1",
                            hasresolvent: cfg.solution[getRandom(0, 1)],
                            handledate: dateutils.format(new Date(), 'yyyy-MM-dd') + "T00:00:00",
                        };
                        dirtyDataTempArr.push(dirtyItem);

                        // 超过生成总数，直接退出
                        let cp_genGroupNum = cfg.cp_genGroupNum;
                        if (cp_genGroupNum !== -1 && (cp_genGroupNum === 0 || genGroupNumAlreay >= cp_genGroupNum)) {
                            return genGroupNumAlreay;
                        }
                        else {
                            if (dirtyDataTempArr.length >= cfg.cp_pagesize) {
                                let codekey = {
                                    unitcode: commonData.unitProject,
                                    nodecode: lastNode.id,
                                    problemcode: problem.index,
                                };

                                genGroupNumAlreay++;

                                // 每提交一次数据，每次新增一组，并将临时数据置空
                                uploadPostDataOnce(codekey, commonData, dirtyDataTempArr, genGroupNumAlreay);
                                dirtyDataTempArr = [];
                            }
                        }
                    }
                }
            }
        }
    }
    return genGroupNumAlreay;
}

/**
 * 分批次上传
 * @param unitcode 单位编码
 * @param nodecode 隐患node编码
 * @param problemcode 问题编码
 * @param commonData
 * @param dirtyDataTempArr
 * @param genGroupNumAlreay 向服务器同步第n组数据
 */
function uploadPostDataOnce({unitcode, nodecode, problemcode}, commonData, dirtyDataTempArr, genGroupNumAlreay) {
    tips(true, '正在生成第 ' + genGroupNumAlreay + ' 组数据');
    commonData.dirtydata = JSON.stringify(dirtyDataTempArr);
    let requestData = {
        appid: appid,
        unitcode: unitcode,
        nodecode: nodecode,
        problemcode: problemcode,
        postData: JSON.stringify(commonData),
    };
    let result = cp_post_sync(cfg.crccBaseUrl + '/crcc/uploadPostData', requestData);
    tips(false, '上传要提交的数据结果，' + JSON.stringify(result));
}

/**
 * 获取fid
 * @returns {*}
 */
function getfid() {
    return window.frames[0]._fid;
}
