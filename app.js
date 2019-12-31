const Koa = require('koa'),
    router = require('koa-router')(),
    render = require('koa-art-template'),
    static = require('koa-static'),
    path = require('path'),
    app = new Koa(),
    admin = require('./routes/admin'),
    index = require('./routes/index'),
    api = require('./routes/api'),
    urlPath = 'http://localhost:',
    port = '3000';

render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
});

router.use('/admin', admin)
    .use('/api', api)
    .use(index);

app.use(static(path.join(__dirname, 'public')))
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
    
console.log(`\r\nServer is running at ${urlPath + port}\r\n===============================================\r\n`);