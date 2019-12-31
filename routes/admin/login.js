const router = require('koa-router')(),
    DB = require('../../model/dbHelper'),
    tools = require('../../model/tools');


router.get('/', async (ctx) => {
    await ctx.render('admin/login', { title: 'hgfvbv:CMS后台管理系统' });
}).post('/doLogin', async (ctx) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password;

    let result = await DB.find('admin', { username, "password": tools.md5(tools.md5(password)) });

    if (result.length > 0) {
        ctx.session.userinfo = result[0];
        ctx.redirect(`${ctx.state.__ROOT__}/admin`);
    } else {
        console.log('失败');
    }
});

module.exports = router.routes();