const router = require('koa-router')(),
    validator = require('validator'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');


router.get('/', async (ctx) => {
    let result = await DB.find('admin', {});
    await ctx.render('admin/manage/index', { list: result });

}).get('/add', async (ctx) => {
    await ctx.render('admin/manage/add');
}).post('/doAdd', async (ctx) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password,
        rpassword = ctx.request.body.rpassword;

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
            let result = await DB.insert('admin', { username, password: tools.md5(tools.md5(password)), status: 1, add_time, last_time });
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
}).post('/doEdit', async (ctx) => {
    let id = ctx.request.body.id,
        username = ctx.request.body.username,
        password = ctx.request.body.password,
        rpassword = ctx.request.body.rpassword;

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
            let result = await DB.update('admin', { _id: DB.getObjectId(id) }, { password: tools.md5(tools.md5(password)) });
            if (result.modifiedCount > 0) {
                ctx.redirect(`${ctx.state.__ROOT__}/admin/manage`);
            } else {
                await ctx.render('admin/error', {
                    msg: '对不起！服务器异常！请稍后再试！',
                    redirect: `${ctx.state.__ROOT__}/admin/manage/edit?id=${id}`
                });
            }
        }
    } else {
        ctx.redirect(`${ctx.state.__ROOT__}/admin/manage`);
    }
});


module.exports = router.routes();