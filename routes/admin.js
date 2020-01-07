const router = require('koa-router')(),
    login = require('./admin/login'),
    url = require('url'),
    ueditor = require('koa2-ueditor'),
    index = require('./admin/index'),
    user = require('./admin/user'),
    manage = require('./admin/manage'),
    articlecate = require('./admin/articlecate'),
    validator = require('validator'),
    DB = require('../model/dbHelper'),
    article = require('./admin/article'),
    request = require('request');

router.use(async (ctx, next) => {
    ctx.state.__ROOT__ = 'http://' + ctx.request.header.host;

    let pathname = url.parse(ctx.url).pathname.substr(1);
    let splitUrl = pathname.split('/');

    ctx.state.G = {
        userinfo: ctx.session.userinfo || '',
        url: splitUrl,   //此url用来做views/public/nav.html中的左边栏的选中状态判断
        prevPage: ctx.request.headers['referer'] //上一页的地址
    };

    if (ctx.session.userinfo) {
        await next();
    } else if (ctx.cookies.get('userCache')) {
        //自动登录
        if (pathname == 'admin/login' || pathname == 'admin/login/doLogin' || pathname == 'admin/login/code' || pathname == 'admin/login/loginOut') {
            await next();
        } else {
            let dataC = JSON.parse(Buffer(ctx.cookies.get('userCache'), 'base64').toString());

            //判断用户名和密码是否只有数字和字母
            if (validator.isAlphanumeric(dataC.username) && validator.isAlphanumeric(dataC.password)) {
                let result = await DB.find('admin', { username: dataC.username, password: dataC.password });

                if (result.length > 0) {
                    if (result[0].status == 1) {
                        await DB.update('admin', { '_id': DB.getObjectId(result[0]._id) }, { 'last_time': new Date() });
                        let data = {
                            _id: result[0]._id,
                            username: result[0].username,
                            status: result[0].status,
                            img_url: result[0].img_url
                        };
                        ctx.session.userinfo = data;
                        //重新赋值全局，否则第一次从cookie进入时头像是无url的
                        ctx.state.G.userinfo = ctx.session.userinfo || '';
                        await next();

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
        }
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