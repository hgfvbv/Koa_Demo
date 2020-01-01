const router = require('koa-router')(),
    login = require('./admin/login'),
    url = require('url'),
    user = require('./admin/user'),
    manage = require('./admin/manage');

router.use(async (ctx, next) => {
    ctx.state.__ROOT__ = 'http://' + ctx.request.header.host;

    let pathname = url.parse(ctx.url).pathname.substr(1);
    let splitUrl = pathname.split('/');
    ctx.state.G = {
        userinfo: ctx.session.userinfo,
        url: splitUrl
    };
    if (ctx.session.userinfo) {
        await next();
    } else {
        if (pathname == 'admin/login' || pathname == 'admin/login/doLogin' || pathname == 'admin/login/code') {
            await next();
        } else {
            ctx.redirect('/admin/login');
        }
    }
});

router.get('/', async (ctx) => {
    await ctx.render('admin/index');
});

router.use('/login', login)
    .use('/user', user)
    .use('/manage', manage);

module.exports = router.routes();