const router = require('koa-router')();


router.get('/', async (ctx) => {
    await ctx.render('admin/login', { title: 'hgfvbv:CMS后台管理系统' });
});

module.exports = router.routes();