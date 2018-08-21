const fs = require('fs');
const tesseract = require('node-tesseract');
const gm = require('gm').subClass({imageMagick: true});

const filePath = 'image_gm.jpg';


const getCode = imgName => {
    processImg(imgName)
        .then(recognizer)
        .catch((err) => {
            console.log(err);
        })
}

function processImg(imgName) {
    return new Promise((resolve, reject) => {
        gm(imgName)
            .colorspace('gray')
            .normalize()
            .threshold('50%')
            .write(filePath, function (err) {
                if (err)
                    return reject(err);
                resolve(filePath);
            });
    });
}

function recognizer(imageNameProcessed) {
    return new Promise((resolve, reject) => {
        // options = {psm: 7};
        options = {};
        tesseract.process(imageNameProcessed, options, function (err, text) {
            if (err) {
                return reject(err);
            }
            resolve(text);
        })
    })
}

getCode("image.jpg");


// gm('image.jpg')
//     .size(function (err, size) {
//         if (err) console.log(err);
//         console.log(size.width > size.height ? 'wider' : 'taller than you');
//     });

// module.exports = {
//     getCode: getCode
// }