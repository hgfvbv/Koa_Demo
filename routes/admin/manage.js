const router = require('koa-router')(),
    validator = require('validator'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');


router.get('/', async (ctx) => {
    let result = await DB.find('admin', {});
    await ctx.render('admin/manage/index', { list: result });

}).get('/add', async (ctx) => {
    await ctx.render('admin/manage/add');
}).post('/doAdd', tools.multerInit('public/upload/admin').single('img_url'), async (ctx) => {
    let username = ctx.req.body.username,
        password = ctx.req.body.password,
        rpassword = ctx.req.body.rpassword,
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        img_url = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : 'admin/avatars/avatar2.png';  //   public\upload\1578206047179.jpg;

    if (!/^\w{4,20}/.test(username)) {
        await ctx.render('admin/error', {
            msg: '用户名长度须在4-20位之间！',
            redirect: `${ctx.state.__ROOT__}/admin/manage/add`
        });
    } else if (!validator.isAlphanumeric(username)) {
        console.log('后台警告：添加管理员用户名有非法字符！');
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/manage/add`
        });
    } else if (password.length < 6) {
        await ctx.render('admin/error', {
            msg: '密码长度须不小于6位！',
            redirect: `${ctx.state.__ROOT__}/admin/manage/add`
        });
    } else if (!validator.isAlphanumeric(password)) {
        console.log('后台警告：添加管理员密码有非法字符！');
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/manage/add`
        });
    } else if (password != rpassword) {
        await ctx.render('admin/error', {
            msg: '两次密码不一致！',
            redirect: `${ctx.state.__ROOT__}/admin/manage/add`
        });
    } else {
        if ((await DB.find('admin', { username })).length > 0) {
            await ctx.render('admin/error', {
                msg: '对不起！此账户已存在！',
                redirect: `${ctx.state.__ROOT__}/admin/manage/add`
            });
        } else {
            let add_time = last_time = new Date();
            let result = await DB.insert('admin', { username, password: tools.md5(tools.md5(password)), status: 1, add_time, last_time, img_url });
            if (result.insertedCount > 0) {
                ctx.redirect(`${ctx.state.__ROOT__}/admin/manage`);
            } else {
                await ctx.render('admin/error', {
                    msg: '对不起！服务器异常！请稍后再试！',
                    redirect: `${ctx.state.__ROOT__}/admin/manage/add`
                });
            }
        }
    }
}).get('/edit', async (ctx) => {
    let _id = DB.getObjectId(ctx.query.id);
    let list = (await DB.find('admin', { _id }))[0];
    await ctx.render('admin/manage/edit', { list });
}).post('/doEdit', tools.multerInit('public/upload/admin').single('img_url'), async (ctx) => {
    let id = ctx.req.body.id,
        username = ctx.req.body.username,
        password = ctx.req.body.password,
        rpassword = ctx.req.body.rpassword,
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        img_url = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : '';  //   public\upload\1578206047179.jpg;;

    if (password != '' || img_url != '') {
        let json = {};
        if (password != '') {
            if (password.length < 6) {
                await ctx.render('admin/error', {
                    msg: '密码长度须不小于6位！',
                    redirect: `${ctx.state.__ROOT__}/admin/manage/edit?id=${id}`
                });
            } else if (!validator.isAlphanumeric(password)) {
                console.log('后台警告：编辑管理员密码有非法字符！');
                await ctx.render('admin/error', {
                    msg: '对不起！服务器异常！请稍后再试！',
                    redirect: `${ctx.state.__ROOT__}/admin/manage/edit?id=${id}`
                });
            } else if (password != rpassword) {
                await ctx.render('admin/error', {
                    msg: '两次密码不一致！',
                    redirect: `${ctx.state.__ROOT__}/admin/manage/edit?id=${id}`
                });
            } else {
                json.password = tools.md5(tools.md5(password))
            };
        }
        if (img_url) {
            json.img_url = img_url;
        }
        let result = await DB.update('admin', { _id: DB.getObjectId(id) }, json);
        if (result.modifiedCount > 0) {
            ctx.redirect(`${ctx.state.__ROOT__}/admin/manage`);
        } else {
            await ctx.render('admin/error', {
                msg: '对不起！服务器异常！请稍后再试！',
                redirect: `${ctx.state.__ROOT__}/admin/manage/edit?id=${id}`
            });
        }
    } else {
        ctx.redirect(`${ctx.state.__ROOT__}/admin/manage`);
    }
});


module.exports = router.routes();