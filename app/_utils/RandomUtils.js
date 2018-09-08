let RandomUtils = {}

// 数字
let numberArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
// 小写字母
let letterLowerArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
// 大写字母
let letterUpperArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// 特殊字符
let specialCharArr = ['-', '.', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', ':', '<', '>', '?'];


RandomUtils.randomType = {
    number: Math.pow(2, 0),
    letterLower: Math.pow(2, 1),
    letterUpper: Math.pow(2, 2),
    specialChar: Math.pow(2, 3),
}


/**
 * 生成随机字符串
 * @param length 长度
 * @param type 类型
 * @returns {string}
 */
RandomUtils.generateRandom = function (length, type) {
    let arr = [];
    if ((type & RandomUtils.randomType.number) === RandomUtils.randomType.number) {
        arr = arr.concat(numberArr);
    }
    if ((type & RandomUtils.randomType.letterLower) === RandomUtils.randomType.letterLower) {
        arr = arr.concat(letterLowerArr);
    }
    if ((type & RandomUtils.randomType.letterUpper) === RandomUtils.randomType.letterUpper) {
        arr = arr.concat(letterUpperArr);
    }
    if ((type & RandomUtils.randomType.specialChar) === RandomUtils.randomType.specialChar) {
        arr = arr.concat(specialCharArr);
    }

    let str = '';
    for (let i = 0; i < length; i++) {
        str += arr[Math.round(Math.random() * (arr.length - 1))];
    }
    return str;
}

/**
 * 生成固定长度的随机数字字符串
 * @param length 长度
 */
RandomUtils.generateNumberStr = function (length) {
    return this.generateRandom(length, this.randomType.number);
}

/**
 * 获取固定长度的随机小写字母的字符串
 * @param length 长度
 * @returns {string}
 */
RandomUtils.generateLowerLetter = function (length) {
    return this.generateRandom(length, this.randomType.letterLower);
}

/**
 * 获取固定长度的随机小写字母的字符串
 * @param length 长度
 * @returns {string}
 */
RandomUtils.generateUpperLetter = function (length) {
    return this.generateRandom(length, this.randomType.letterUpper);
}

/**
 * 获取固定长度的随机字母的字符串
 * @param length 长度
 * @returns {string}
 */
RandomUtils.generateLetter = function (length) {
    return this.generateRandom(length, this.randomType.letterLower + this.randomType.letterUpper);
}

/**
 * 生成固定长度的随机字符串，字母+数字
 * @param length 长度
 * @returns {string}
 */
RandomUtils.generateLetterAndNumber = function (length) {
    return this.generateRandom(length, this.randomType.number + this.randomType.letterLower + this.randomType.letterUpper);
}

console.log(RandomUtils.generateRandom(32, RandomUtils.randomType.number + RandomUtils.randomType.letterUpper));

module.exports = RandomUtils;