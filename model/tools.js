const md5 = require('md5'),
    multer = require('koa-multer'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

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
    },
    cookieOptions() {
        return {
            path: '/admin',   //cookie写入的路径
            maxAge: 604800000,   //7天有效期  1000 * 60 * 60 * 24 * 7
            httpOnly: false,
            overwrite: false
        };
    },
    multerInit(path) {
        var storage = multer.diskStorage({
            destination: (req, file, cb) => {
                fs.exists(path, (exists) => {
                    if (!exists) {
                        mkdirp(path, (err) => {
                            if (err) {
                                console.log(`后台警告：增加内容创建上传图片文件夹错误！ ${err}`);
                            } else {
                                cb(null, path);   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
                            }
                        });
                    } else {
                        cb(null, path);   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
                    }
                });
            },
            filename: (req, file, cb) => {   /*图片上传完成重命名*/
                let fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
                cb(null, `${Date.now()}.${fileFormat[fileFormat.length - 1]}`);
            }
        });
        return multer({ storage });
    }
};

module.exports = tools;