const router = require('koa-router')(),
    validator = require('validator'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');


router.get('/', async (ctx) => {
    let data = await DB.find('articlecate', {});
    let result = tools.cateToList(data);
    await ctx.render('admin/articlecate/index', { list: result });
}).get('/add', async (ctx) => {
    let catelist = await DB.find('articlecate', { 'pid': '0' });
    await ctx.render('admin/articlecate/add', { catelist });
}).post('/doAdd', async (ctx) => {
    let title = ctx.request.body.title,
        pid = ctx.request.body.pid,
        keywords = ctx.request.body.keywords,
        status = ctx.request.body.status,
        description = ctx.request.body.description,
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    if (flag.test(title)) {
        console.log('后台警告：增加分类标题有非法字符！');
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
        });
    } else if (keywords != '' && flag.test(keywords)) {
        console.log('后台警告：增加分类关键字有非法字符！');
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
        });
    }
    // else if (description != '' && !validator.isAlphanumeric(description)) {
    //     console.log('后台警告：增加分类描述有非法字符！');
    //     await ctx.render('admin/error', {
    //         msg: '对不起！服务器异常！请稍后再试！',
    //         redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
    //     });
    // } 
    else {
        let add_time = new Date();
        let result = await DB.insert('articlecate', { title, pid, keywords, add_time, status, description });
        if (result.insertedCount > 0) {
            ctx.redirect(`${ctx.state.__ROOT__}/admin/articlecate`);
        } else {
            await ctx.render('admin/error', {
                msg: '对不起！服务器异常！请稍后再试！',
                redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
            });
        }
    }
}).get('/edit', async (ctx) => {
    let _id = DB.getObjectId(ctx.query.id);
    let list = (await DB.find('articlecate', { _id }))[0];
    let catelist = await DB.find('articlecate', { 'pid': '0' });
    await ctx.render('admin/articlecate/edit', { list, catelist });
}).post('/doEdit', async (ctx) => {
    let id = ctx.request.body.id,
        title = ctx.request.body.title,
        pid = ctx.request.body.pid,
        keywords = ctx.request.body.keywords,
        status = ctx.request.body.status,
        description = ctx.request.body.description,
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    if (flag.test(title)) {
        console.log('后台警告：编辑分类标题有非法字符！');
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
        });
    } else if (keywords != '' && flag.test(keywords)) {
        console.log('后台警告：编辑分类关键字有非法字符！');
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
        });
    }
    // else if (description != '' && !validator.isAlphanumeric(description)) {
    //     console.log('后台警告：编辑分类描述有非法字符！');
    //     await ctx.render('admin/error', {
    //         msg: '对不起！服务器异常！请稍后再试！',
    //         redirect: `${ctx.state.__ROOT__}/admin/articlecate/add`
    //     });
    // } 
    else {
        let result = await DB.update('articlecate', { _id: DB.getObjectId(id) }, { title, pid, keywords, status, description });

        if (result.modifiedCount > 0) {
            ctx.redirect(`${ctx.state.__ROOT__}/admin/articlecate`);
        } else {
            await ctx.render('admin/error', {
                msg: '对不起！服务器异常！请稍后再试！',
                redirect: `${ctx.state.__ROOT__}/admin/articlecate/edit?id=${id}`
            });
        }
    }
});


module.exports = router.routes();