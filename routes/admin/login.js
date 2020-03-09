const router = require('koa-router')(),
    svgCaptcha = require('svg-captcha'),
    validator = require('validator'),
    DB = require('../../model/dbHelper'),
    tools = require('../../model/tools'),
    title = 'hgfvbv@CMS后台管理系统';

router.get('/', async (ctx) => {
    await ctx.render('admin/login', { title });
}).post('/doLogin', async (ctx) => {
    let username = ctx.request.body.username.trim(),
        password = ctx.request.body.password.trim(),
        code = ctx.request.body.code ? ctx.request.body.code.trim() : '',  //必须如此，否则数据为空时会出现异常
        sessionCode = ctx.session.code ? ctx.session.code.toString() : '', //必须如此，否则数据为空时会出现异常
        isRemember = ctx.request.body.isRemember;

    if (code.toLocaleLowerCase() == sessionCode.toLocaleLowerCase()) {
        //判断用户名和密码是否只有数字和字母
        if (validator.isAlphanumeric(username) && validator.isAlphanumeric(password)) {
            let result = await DB.find('admin', { username, "password": tools.md5(tools.md5(password)) });

            if (result.length > 0) {
                if (result[0].status == 1) {
                    await DB.update('admin', { '_id': DB.getObjectId(result[0]._id) }, { 'last_time': new Date() });
                    let data = {
                        _id: result[0]._id,
                        username: result[0].username,
                        status: result[0].status,
                        img_url: result[0].img_url
                    };

                    if (isRemember != undefined) {
                        let dataC = {
                            username: result[0].username,
                            password: result[0].password
                        };
                        let buffer = new Buffer(JSON.stringify(dataC)).toString('base64');
                        ctx.cookies.set('userCache', buffer, tools.cookieOptions());
                    } else {
                        ctx.cookies.set('userCache', null, { path: '/admin', expires: new Date('2010/12/31') });
                    }
                    ctx.session.userinfo = data;

                    ctx.session.code = null;
                    ctx.redirect(`${ctx.state.__ROOT__}/admin`);
                } else {
                    await ctx.render('admin/error', {
                        title,
                        msg: '对不起！该账户已被锁定！',
                        redirect: `${ctx.state.__ROOT__}/admin/login`
                    });
                }
            } else {
                await ctx.render('admin/error', {
                    title,
                    msg: '对不起！用户名或密码错误！',
                    redirect: `${ctx.state.__ROOT__}/admin/login`
                });
            }
        } else {
            console.log('后台警告：登陆用户名或密码有特殊字符！');
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