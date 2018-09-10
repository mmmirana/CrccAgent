function testRandom() {
    let RandomUtils = require('../_utils/RandomUtils');
    console.log(RandomUtils.generateRandom(8, RandomUtils.randomType.number + RandomUtils.randomType.letterUpper));
}

async function testEmail() {
    let EmailUtils = require('../_utils/EmailUtils');
    let emialOps = {
        fromEmail: '18166748035@163.com',
        toEmails: ['18166748035@163.com', '420039341@qq.com',],
        subject: 'this is subject',
        text: 'this is content',
        html: '<h3>hello, this is html</h3>',
    };
    try {
        let info = await EmailUtils.send(emialOps);
        console.log(JSON.stringify(info));
    } catch (e) {
        console.log(e);
    }
}

testRandom();
// testEmail()