// 尝试登陆的次数
let cp_login_num = 0;

$().ready(function () {
    var $draggable = $('#plugin_pop').draggabilly({
        // 选项（配置）...
        containment: true,
        handle: '.handle',
    });
});

/**
 * 一键登录
 */
function loginOnekey() {

    let email = $("#email").val();
    // 初始化配置
    let config = initCfg(email);

    if (config) {
        plugin_login(config);
    }

}


/**
 * 插件登录
 * @param config
 */
function plugin_login(config) {

    cp_login_num++;

    tips(true, '[ I ]正在尝试第 ' + cp_login_num + ' 次登录');

    let appid = config.appid;
    let username = config.username;
    let password = config.password;
    let $img = $("#randImg");
    let validcode = resolveCode($img);

    if (validcode && validcode.length === 4) {
        let loginData = {
            account: username,
            password: password,
            verifycode: validcode
        };

        cp_post("http://aqgl.crcc.cn/login.do?reqCode=login", loginData).then(function (loginResult) {
            if (loginResult.success === true) {
                let useridData = {
                    appid: appid,
                    guserid: loginResult.userid,
                };
                storageutils.set("cp_guserid", loginResult.userid);

                cp_post(cfg.crccBaseUrl + '/crcc/updateConfigUserid', useridData)
                    .then(function (updateUseridResult) {
                        tips(false, '[ I ]更新插件服务器数据结果: ' + JSON.stringify(updateUseridResult));
                        tips(true, '[ I ]正在跳转隐患填报页面，请稍后...');

                        setTimeout(function () {
                            // window.location.href = "http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501";
                            window.location.href = "http://aqgl.crcc.cn/index.do?reqCode=indexInit";
                        }, 1000);
                    });

            } else if (loginResult.success === false) {
                if (loginResult.errorType === "1") {
                    window.location.href = 'http://aqgl.crcc.cn/login.do?reqCode=logout';
                } else {
                    // 重新登录
                    $img.click();
                    setTimeout(function () {
                        plugin_login(config)
                    }, 1000);
                }
            }
        });
    } else {
        // 重新登录
        $img.click();
        setTimeout(function () {
            plugin_login(config);
        }, 1000);
    }
}