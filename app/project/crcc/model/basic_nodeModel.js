const BaseModel = require('../../base/model/BaseModel');

class model extends BaseModel {
    /**
     * 插入隐患节点
     * @param yinHuanArr
     */
    async insertYinhuanNodes(yinHuanArr) {
        for (let i = 0; i < yinHuanArr.length; i++) {
            let yinHuan = yinHuanArr[i];
            let yinHuanModel = {
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

            let number = await super.count({"id": yinHuanModel.id});
            if (number === 0) {
                await super.insert(yinHuanModel);
            }
        }
    };
}

module.exports = new model("basic_nodes");