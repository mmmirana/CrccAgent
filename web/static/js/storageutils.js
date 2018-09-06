!function () {
    let storageutils = {};

    storageutils.get = function (name) {
        return JSON.parse(localStorage.getItem(name))
    };

    storageutils.set = function (name, val) {
        localStorage.setItem(name, JSON.stringify(val))
    };

    storageutils.add = function (name, addVal) {
        let oldVal = this.get(name);
        let newVal = oldVal.concat(addVal)
        this.set(name, newVal);
    };

    storageutils.rm = function (name) {
        localStorage.removeItem(name);
    }

    window.storageutils = storageutils;

}();