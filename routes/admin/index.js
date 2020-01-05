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
        if (userinfo[0][attr] == 1) {
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
}).post('/remove', async (ctx) => {
    let prevPage = ctx.state.G.prevPage || '',
        collectionName = ctx.request.body.collectionName,
        _id = DB.getObjectId(ctx.request.body.id);

    let result = await DB.delete(collectionName, { _id });
    if (result.deletedCount > 0) {
        ctx.body = { 'message': '删除成功！', 'success': true, prevPage };
    } else {
        ctx.body = { 'message': '删除失败！', 'success': false, prevPage };
    }
}).post('/changeSort', async (ctx) => {
    let prevPage = ctx.state.G.prevPage,
        collectionName = ctx.request.body.collectionName,
        sort = parseInt(ctx.request.body.sort),
        _id = DB.getObjectId(ctx.request.body.id);

    let json = { sort };

    let result = await DB.update(collectionName, { _id }, json);

    if (result.modifiedCount > 0) {
        ctx.body = { 'message': '更新成功！', 'success': true, prevPage };
    } else {
        ctx.body = { 'message': '更新失败！', 'success': false };
    }
});

module.exports = router.routes();