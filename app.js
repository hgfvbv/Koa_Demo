const Koa = require('koa'),
    router = require('koa-router')(),
    render = require('koa-art-template'),
    static = require('koa-static'),
    session = require('koa-session'),
    bodyparser = require('koa-bodyparser'),
    path = require('path'),
    app = new Koa(),
    admin = require('./routes/admin'),
    index = require('./routes/index'),
    api = require('./routes/api'),
    urlPath = 'http://localhost:',
    port = '3000';

//配置session的中间件
app.keys = ['some secret hurr'];
const CONFIG = {
    key: 'koa:sess',
    maxAge: 1200000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true,   /*每次请求都重新设置session*/
    renew: false,
};

render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
});

router.use('/admin', admin)
    .use('/api', api)
    .use(index);

app.use(bodyparser())
    .use(session(CONFIG, app))
    .use(static(path.join(__dirname, 'public')))
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port);

console.log(`\r\nServer is running at ${urlPath + port}\r\n===============================================\r\n`);