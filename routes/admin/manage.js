const router = require('koa-router')(),
    DB = require('../../model/dbHelper');


router.get('/', async (ctx) => {
    let result = await DB.find('admin', {});
    await ctx.render('admin/manage/index', { list: result });

}).get('/add', async (ctx) => {
    await ctx.render('admin/manage/add');
});


module.exports = router.routes();