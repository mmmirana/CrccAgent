let x = []
for (let i = 0; i < 100; i++) {
    x.push(i + 1);
}

let resut = [];
let groupsize = 3;
for (let i = 0, len = x.length; i < len; i += groupsize) {
    resut.push(x.slice(i, i + 3));
}
console.log(JSON.stringify(resut));