const router = require('koa-router')();


router.get('/', async (ctx) => {

    await ctx.render('admin/user/index');

}).get('/add', async (ctx) => {
    await ctx.render('admin/user/add');
});


module.exports = router.routes();