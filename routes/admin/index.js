const router = require('koa-router')(),
    DB = require('../../model/dbHelper');

router.get('/', async (ctx) => {
    await ctx.render('admin/index');
}).post('/changeStatus', async (ctx) => {
    let collectionName = ctx.request.body.collectionName,
        attr = ctx.request.body.attr,
        _id = DB.getObjectId(ctx.request.body.id);

    let userinfo = await DB.find(collectionName, { _id });
    if (userinfo.length > 0) {
        let json = {};
        if (userinfo[0].status == 1) {
            json = {
                [attr]: 0
            };
        } else {
            json = {
                [attr]: 1
            };
        }
        let result = await DB.update(collectionName, { _id }, json);
        if (result.modifiedCount > 0) {
            ctx.body = { 'message': '更新成功！', 'success': true };
        } else {
            ctx.body = { 'message': '更新失败！', 'success': false };
        }
    } else {
        ctx.body = { 'message': '更新失败，参数错误！', 'success': false };
    }
});

module.exports = router.routes();