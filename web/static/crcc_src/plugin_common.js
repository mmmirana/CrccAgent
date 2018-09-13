let cp_msgStack = [];
let mduiOpt = {
    confirmText: '确定',
    cancelText: '取消',
    modal: true,//模态化窗口，点击外部不能关闭
};

/**
 * post请求
 * @param url
 * @param data
 * @returns {*}
 */
function cp_get(url, data, dataType) {
    let defer = $.Deferred();
    $.ajax({
        url: url,
        type: 'get',
        data: data,
        dataType: dataType || 'json',
        success: function (rep) {
            defer.resolve(rep);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            tips(true, '' + jqXHR.statusText);
        }
    });
    return defer.promise();
}

/**
 * post请求
 * @param url
 * @param data
 * @returns {*}
 */
function cp_post(url, data, dataType) {
    let defer = $.Deferred();
    $.ajax({
        url: url,
        type: 'post',
        data: data || {},
        dataType: dataType || 'json',
        success: function (rep) {
            defer.resolve(rep);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            tips(true, '' + jqXHR.statusText);
        }
    });
    return defer.promise();
}


/**
 * post请求
 * @param url
 * @param data
 * @returns {*}
 */
function cp_post_sync(url, data, dataType) {
    let response = null;
    $.ajax({
        async: false,
        url: url,
        type: 'post',
        data: data || {},
        dataType: dataType || 'json',
        success: function (rep) {
            response = rep;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            tips(true, '' + jqXHR.statusText);
        }
    });
    return response;
}

/**
 * 获取随机数
 * @param min 最小值
 * @param max 最大值
 */
function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(0);
}

/**
 * 获取随机数
 * @param min 最小值
 * @param max 最大值
 */
function getRandomInt(min, max) {
    return (Math.random() * (max - min) + min).toFixed(0) * 1;
}

/**
 * 解析验证码
 * @param $img
 * @returns {string}
 */
function resolveCode($img) {
    let base64Img = getBase64Image($img);
    if (!base64Img) return "";
    let codeData = cp_post_sync(cfg.crccBaseUrl + '/common/resolveCode', {base64Img: base64Img});
    if (codeData && codeData.code === 1) {
        return codeData.data;
    } else {
        tips(true, '[ E ]解析验证码异常');
        return "";
    }
}

function getBase64Image($img) {
    if ($img.length === 0) {
        tips(true, '[ E ]抱歉，找不到对应的验证码');
        return;
    }
    try {
        let img = $img[0];
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
        let dataURL = canvas.toDataURL("image/" + ext);
        return dataURL;
    } catch (e) {
        tips(true, '[ E ]抱歉，验证码异常。');
        return '';
    }
}

/**
 * 测试心跳接口
 */
function testCrccAgent() {
    $.ajax({
        url: cfg.crccBaseUrl + '/crcc/Heartbeat',
        type: 'get',
        dataType: "json",
        success: function (data) {
            tips(true, '[ I ]插件服务器正常，请放心进行后续操作！');
        },
        error: function () {
            tips(true, '[ E ]抱歉，服务器异常，请联系mmmirana@qq.com');
        }
    })
}

/**
 * 提示信息
 * @param showInfo 是否显示在界面上
 * @param msg 信息
 */
function tips(showInfo, msg) {
    console.log(showInfo, msg);
    setTimeout(function () {
        if (showInfo) {
            if (cp_msgStack.length >= (cfg.cp_tipsLength || 5)) {
                cp_msgStack.shift();
            }
            cp_msgStack.push(msg);
            $tips = $("#tips");
            if ($tips.length > 0) {
                let tipsInnnerHtml = cp_msgStack.map(function (v) {
                    return "<span>" + v + "</span>";
                });
                $tips.html(tipsInnnerHtml.join("<br>"));
            }
        }
    }, 100);

}

function plugin_logout() {
    window.location.href = 'http://aqgl.crcc.cn/login.do?reqCode=logout';
}

/**
 * 插件加载中
 */
function cpLoading(title, content) {
    let inst = new mdui.Dialog('#customLoading');
    if (title) {
        $("#customLoading .mdui-dialog-title").text(title);
    } else {
        $("#customLoading .mdui-dialog-title").text("提示");
    }
    if (content) {
        $("#customLoading .customContent").text(content);
    } else {
        $("#customLoading .customContent").text("");
    }
    inst.open();
    return inst;
}

/**
 * 初始化配置
 * @param email
 */
function initCfg(email) {
    let configData = cp_post_sync(cfg.crccBaseUrl + '/crcc/getconfig', {
        email: email,
    });

    if (configData && configData.code === 1) {
        let config = configData.data;

        // 将邮对应的appid，username和email放入localstorage
        window.storageutils.set("cp_appid", config.appid);
        window.storageutils.set("cp_email", email);
        window.storageutils.set("cp_gusername", config.username);

        window.cfg = {
            crccBaseUrl: config.crccBaseUrl,
            cp_genGroupNum: config.cp_genGroupNum,
            cp_pagesize: config.cp_pagesize,
            cp_tipsLength: config.cp_tipsLength,
            cp_totalpage: config.cp_totalpage,
            crcctitle: config.crcctitle,
            solution: JSON.parse(config.solution),
        };
        tips(true, `[ I ] 获取系统配置成功`);
        return config;
    } else {
        tips(true, `[ E ] 获取系统配置失败，${configData ? configData.msg : '请确认该邮箱是否已授权'}`);
    }
}

/**
 * ajax返回数据，获取错误信息
 * @param result
 * @return {string}
 */
function getResultErrorMsg(result) {
    return result ? result.msg : '插件服务器异常';
}

/**
 * 将数组arr分组，每组的长度groupsize
 */
function groupArrayBySize(arr, groupsize) {
    groupsize = groupsize || 100;
    let groupArr = [];
    for (let i = 0, len = arr.length; i < len; i += groupsize) {
        groupArr.push(arr.slice(i, i + groupsize));
    }
    return groupArr;
}