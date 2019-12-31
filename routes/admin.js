const router = require('koa-router')(),
    login = require('./admin/login'),
    url = require('url'),
    user = require('./admin/user');

router.use(async (ctx, next) => {
    ctx.state.__ROOT__ = 'http://' + ctx.request.header.host;

    let pathname = url.parse(ctx.url).pathname;
    if (ctx.session.userinfo) {
        await next();
    } else {
        if (pathname == '/admin/login' || pathname == '/admin/login/doLogin') {
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
    .use('/user', user);

module.exports = router.routes();