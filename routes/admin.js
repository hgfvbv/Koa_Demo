const router = require('koa-router')(),
    login = require('./admin/login'),
    url = require('url'),
    ueditor = require('koa2-ueditor'),
    index = require('./admin/index'),
    user = require('./admin/user'),
    manage = require('./admin/manage'),
    articlecate = require('./admin/articlecate'),
    article = require('./admin/article');

router.use(async (ctx, next) => {
    ctx.state.__ROOT__ = 'http://' + ctx.request.header.host;

    let pathname = url.parse(ctx.url).pathname.substr(1);
    let splitUrl = pathname.split('/');
    ctx.state.G = {
        userinfo: ctx.session.userinfo,
        url: splitUrl,   //此url用来做views/public/nav.html中的左边栏的选中状态判断
        prevPage: ctx.request.headers['referer'] //上一页的地址
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

//注意上传图片的路由   ueditor.config.js配置图片post的地址
router.all('/editorUpload', ueditor(['public', {
    "imageAllowFiles": [".png", ".jpg", ".jpeg"],
    "imagePathFormat": "/upload/ueditor/image/{yyyy}{mm}{dd}/{filename}"  // 保存为原文件名
    //"imagePathFormat": `/upload/ueditor/image/{yyyy}{mm}{dd}/${Math.random()*10000000}`  // 保存为原文件名
}]));

router.use(index)
    .use('/login', login)
    .use('/user', user)
    .use('/manage', manage)
    .use('/articlecate', articlecate)
    .use('/article', article);

module.exports = router.routes();