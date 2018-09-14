const BaseModel = require('../../base/model/BaseModel');

class model extends BaseModel {
    /**
     * 插入隐患节点
     * @param appid
     * @param yinHuanArr
     */
    async syncNodes(appid, yinHuanArr) {
        for (let i = 0; i < yinHuanArr.length; i++) {
            let yinHuan = yinHuanArr[i];
            let yinHuanModel = {
                appid: appid,
                text: yinHuan.text,
                score: yinHuan.score,
                danger_longname: yinHuan.danger_longname,
                pid: yinHuan.pid,
                leaf: yinHuan.leaf,
                id: yinHuan.id,
                rleaf: yinHuan.rleaf,
                checked: yinHuan.checked,
                danger_name: yinHuan.danger_name,
                json: JSON.stringify(yinHuan),
            };

            let where = {"id": yinHuanModel.id};
            let number = await super.count(where);
            if (number === 0) {
                await super.insert(yinHuanModel);
            } else {
                await super.update(yinHuanModel, where);
            }
        }
    };
}

module.exports = new model("basic_nodes");