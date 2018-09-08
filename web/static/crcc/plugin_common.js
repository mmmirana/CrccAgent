let cp_msgStack = [];

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
        dataType: dataType || 'text',
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
        tips(true, '解析验证码异常：' + JSON.stringify(codeData));
        return "";
    }
}

function getBase64Image($img) {
    if ($img.length === 0) {
        tips(true, '抱歉，找不到对应的验证码');
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
        tips(true, '抱歉，验证码异常，请手动刷新。');
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
            tips(true, '[ E ]抱歉，服务器异常，请联系QQ420039341');
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
            if (cp_msgStack.length >= cfg.cp_tipsLength) {
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
    let customLoading = $("#customLoading");
    var inst = new mdui.Dialog('#customLoading');
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