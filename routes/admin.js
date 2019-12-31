const router = require('koa-router')(),
    login = require('./admin/login'),
    user = require('./admin/user');

router.use(async (ctx, next) => {
    ctx.state.__HOST__ = 'http://' + ctx.request.header.host;
    await next();
});

router.get('/', async (ctx) => {
    ctx.body = "后台管理";
});

router.use('/login', login)
    .use('/user', user);

module.exports = router.routes();