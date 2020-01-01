const router = require('koa-router')(),
    svgCaptcha = require('svg-captcha'),
    validator = require('validator'),
    DB = require('../../model/dbHelper'),
    tools = require('../../model/tools'),
    title = 'hgfvbv:CMS后台管理系统';


router.get('/', async (ctx) => {
    await ctx.render('admin/login', { title });
}).post('/doLogin', async (ctx) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password,
        code = ctx.request.body.code;

    if (code == ctx.session.code) {
        //判断用户名和密码是否只有数字和字母
        if (validator.isAlphanumeric(username) && validator.isAlphanumeric(password)) {
            let result = await DB.find('admin', { username, "password": tools.md5(tools.md5(password)) });

            if (result.length > 0) {
                ctx.session.userinfo = {
                    _id: result[0]._id,
                    username: result[0].username,
                    status: result[0].status
                };
                ctx.session.code = null;
                ctx.redirect(`${ctx.state.__ROOT__}/admin`);
            } else {
                await ctx.render('admin/error', {
                    title,
                    msg: '对不起！用户名或密码错误！',
                    redirect: `${ctx.state.__ROOT__}/admin/login`
                });
            }
        } else {
            console.log('有特殊字符');
            await ctx.render('admin/error', {
                title,
                msg: '对不起！用户名或密码错误！',
                redirect: `${ctx.state.__ROOT__}/admin/login`
            });
        }
    } else {
        await ctx.render('admin/error', {
            title,
            msg: '对不起！验证码错误！',
            redirect: `${ctx.state.__ROOT__}/admin/login`
        });
    }
    ctx.session.code = null;
}).get('/code', async (ctx) => {
    let captcha = svgCaptcha.createMathExpr({
        noise: 1,
        mathOperator: '+',
        size: 4,
        fontSize: 55,
        width: 120,
        height: 34,
        color: true
    });
    ctx.session.code = captcha.text;
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
}).get('/loginOut', async (ctx) => {
    ctx.session.userinfo = null;
    ctx.redirect(`${ctx.state.__ROOT__}/admin/login`);
});

module.exports = router.routes();