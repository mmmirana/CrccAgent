/**
 * 一键消除隐患
 */
function deldangerOnekey() {
    //同步隐患列表
    syncdangerlist()
        .then(function () {
            // 消除所有隐患
            deldangerByDay().then(function () {
                tips("[ I ]已经为您消除隐患，请核查数据");
            });
        }).catch(function (e) {
    });


}

/**
 * 向插件服务器同步隐患列表
 * @param begin
 * @param end
 * @return {Promise<any>}
 */
function syncdangerlist(begin, end) {

    return new Promise(function (resolve, reject) {

        try {
            let postdangerlistUrl = 'http://aqgl.crcc.cn/safequality/corrective.do?reqCode=getTroubleList';
            let postdangerlistData = {
                begintTime: "",
                endTime: "",
                loginuserid: storageutils.get("cp_guserid")
            };
            cp_post(postdangerlistUrl, postdangerlistData, 'text')
                .done(function (dangerlistJson) {

                    dangerlistJson = dangerlistJson.replace('TOTALCOUNT', '\"TOTALCOUNT\"').replace('ROOT', '\"ROOT\"');

                    let dangerlist = JSON.parse(dangerlistJson).ROOT;

                    tips(true, `[ I ]正在同步 ${dangerlist.length} 条要消除的隐患数据`);

                    // 100条分批次上传
                    let groupsize = 100;

                    let dangerlistGroup = [];
                    for (let i = 0, len = dangerlist.length; i < len; i += groupsize) {
                        dangerlistGroup.push(dangerlist.slice(i, i + groupsize));
                    }

                    for (let i = 0; i < dangerlistGroup.length; i++) {
                        let dangerlistByGroup = dangerlistGroup[i];
                        let uploadResult = cp_post_sync(cfg.crccBaseUrl + '/crcc/uploadDangerlist', {dangerlistJson: JSON.stringify(dangerlistByGroup)});
                        tips(true, `[ I ]第 ${i + 1} 次同步 ${dangerlistByGroup.length} 条隐患数据：${uploadResult ? uploadResult.msg : "服务器异常"}`);
                    }
                    resolve();

                });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * 获取某天要消除的隐患数据
 */
function getdangerlist(someday) {
    return new Promise(function (resolve, reject) {
        let getdangerlistData = {};
        if (someday) {
            getdangerlistData.someday = someday;
        }
        cp_post(cfg.crccBaseUrl + "/crcc/getdangerlist", getdangerlistData)
            .done(function (dangerlistData) {
                tips(true, `[ I ]获取要消除隐患的数据：${dangerlistData.msg}`);
                if (dangerlistData && dangerlistData.code === 1) {
                    resolve(dangerlistData.data);
                } else {
                    reject(dangerlistData ? dangerlistData.msg : '服务器错误');
                }
            })
    });
}

/**
 * 消除某天的隐患
 * @param someday required 如果不传，则删除所有
 */
function deldangerByDay(someday) {
    return new Promise(function (resolve, reject) {
        try {
            // 获取隐患列表
            getdangerlist(someday)
                .then(function (dangerlist) {
                    tips(true, `[ I ]准备消除 ${dangerlist.length}条 隐患数据...`);
                    for (let i = 0; i < dangerlist.length; i++) {
                        let danger = dangerlist[i];
                        // 消除隐患
                        delSingleDanger(danger)
                            .then(function (delResult) {
                                tips(true, `消除 第${i}条 隐患结果：${(delResult.code || 0 === 1) ? '成功' : '失败'}`);
                            });
                    }
                    resolve();
                });
        } catch (e) {
            reject(e);
        }
    })
}

/**
 * 消除单条隐患
 */
function delSingleDanger(danger) {

    return new Promise(function (resolve, reject) {
        try {
            let delsingleData = {
                examine: "1",
                userInfoId: "",
                hasCheckPerson: true,
                loginuserid: storageutils.get("cp_guserid"),
            };
            let dangerData = [{
                "fprojectname": danger.fprojectname,
                "funit": danger.funit,
                "fprojecttypename": danger.fprojecttypename,
                "project_unit_name": danger.project_unit_name,
                "danger_longname": danger.danger_longname,
                "troublename": danger.troublename,
                "dangerdesc": danger.dangerdesc,
                "checkinfo": "将发现的安全隐患已整改",
                "checktime": danger.check_time,
                "dangerstatus": "2",
                "cp_troubleid": danger.cp_troubleid,
                "pid": "",
                "flgid": "0",
                "windowid": "add"
            }];

            delsingleData.dangerData = JSON.stringify(dangerData);

            cp_post("http://aqgl.crcc.cn/safequality/corrective.do?reqCode=insertCorrective", delsingleData)
                .then(function (resp) {
                    if (resp && resp.success === true) {
                        let rmdangerData = {
                            dataid: resp.dataid,
                            sid: danger.sid,
                            sstatus: 1,// 消除隐患成功
                        };

                        // 消除隐患成功更新状态
                        cp_post(cfg.crccBaseUrl + "/crcc/rmdangerBySid", rmdangerData)
                            .then(function (rmdangerResult) {
                                resolve(rmdangerResult);
                            })
                    }
                })
        } catch (e) {
            reject(e);
        }
    })
}