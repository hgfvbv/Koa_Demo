const md5 = require('md5');

let tools = {
    md5(str) {
        return md5(str);
    },
    cateToList(data) {
        let firstArr = [];
        for (let i = 0; i < data.length; i++) {
            let element = data[i];
            if (element.pid == '0') {
                firstArr.push(element);
            }
        }

        for (let i = 0; i < firstArr.length; i++) {
            firstArr[i].list = [];
            for (let j = 0; j < data.length; j++) {
                const elementj = data[j];
                if (firstArr[i]._id == elementj.pid) {
                    firstArr[i].list.push(elementj);
                }
            }
        }

        return firstArr;
    },
    getTime() {
        return new Date();
    }
};

module.exports = tools;