const router = require('koa-router')();


router.get('/', async (ctx) => {

    ctx.body = "用户管理";

});

module.exports = router.routes();