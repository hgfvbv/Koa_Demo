const router = require('koa-router')(),
    DB = require('../model/dbHelper');


router.get('/', async (ctx) => {

    ctx.body = "api接口";

});

router.get('/contentList', async (ctx) => {
    let pageIndex = ctx.query.pageIndex || 1,
        pageSize = 5;
    let content = await DB.find('article', { 'status': 1 }, {}, { pageIndex, pageSize });
    ctx.body = {
        'success': true,
        'message': '获取文章列表成功',
        content
    };
});

router.post('/create', async (ctx) => {
    let id = ctx.body.id;
    ctx.body = {
        'success': true,
        'message': '增加数据成功'
    };
});

router.put('/update', async (ctx) => {
    let id = ctx.body.id;
    ctx.body = {
        'success': true,
        'message': '修改数据成功'
    };
});

router.delete('/delete', async (ctx) => {
     let id = ctx.query.id;
    ctx.body = {
        'success': true,
        'message': '删除数据成功'
    };
});

module.exports = router.routes();