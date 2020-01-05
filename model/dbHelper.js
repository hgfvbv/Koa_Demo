const MongoDB = require('mongodb'),
    MongoClient = MongoDB.MongoClient,
    ObjectID = MongoDB.ObjectID,
    Config = require('./config');

class DB {
    static getInstance() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;
    }

    constructor() {
        this.dbClient = '';
        this.connect();
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (!this.dbClient) {
                MongoClient.connect(Config.dbUrl, (err, client) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.dbClient = client.db(Config.dbName);
                        resolve(this.dbClient);
                    }
                })
            } else {
                resolve(this.dbClient);
            }
        });
    }

    find(collectionName, whereJson, paramsJson, pageJson) {
        let pageIndex = 0,
            pageSize = 0,
            attrJson = {},
            sortJson = {};
        switch (arguments.length) {
            case 2:
                attrJson = {};
                break;
            case 3:
                if (paramsJson.sort) {
                    sortJson = paramsJson.sort;
                }
                if (paramsJson.attr) {
                    attrJson = paramsJson.attr
                }
                break;
            case 4:
                if (paramsJson.sort) {
                    sortJson = paramsJson.sort;
                }
                if (paramsJson.attr) {
                    attrJson = paramsJson.attr
                }
                pageIndex = pageJson.pageIndex || 1;
                pageSize = pageJson.pageSize || 10;
                break;
            default:
                console.log('后台警告：数据库查询参数错误！');
                break;
        }

        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                let data = db.collection(collectionName).find(whereJson, { fields: attrJson }).skip((pageIndex - 1) * pageSize).limit(pageSize).sort(sortJson);
                data.toArray((err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            });
        });
    }

    insert(collectionName, json) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName).insertOne(json, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        });
    }

    update(collectionName, json1, json2) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName).updateOne(json1, { $set: json2 }, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    }

    delete(collectionName, json) {
        return new Promise((resolve, reject) => {
            this.connect().then((db) => {
                db.collection(collectionName).removeOne(json, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    }

    getObjectId(id) {
        return new ObjectID(id);
    }

    getTotalCount(collectionName, whereJson) {
        return new Promise((resolve, reject) => {
            try {
                this.connect().then((db) => {
                    let result = db.collection(collectionName).count(whereJson);
                    result.then((count) => {
                        resolve(count);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = DB.getInstance();