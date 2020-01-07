const router = require('koa-router')(),
    validator = require('validator'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');

router.get('/', async (ctx) => {
    let sortType = ctx.query.sortType || 0,
        pageIndex = ctx.query.pageIndex || 1,
        pageSize = 4;
    let sortJson = {};
    switch (sortType) {
        case '0':
            break;
        case '1':
            //创建日期升序
            sortJson = { add_time: 1 }
            break;
        case '2':
            //创建日期降序
            sortJson = { add_time: -1 }
            break;
        case '3':
            //发布日期升序
            sortJson = { release_time: 1 }
            break;
        case '4':
            //发布日期降序
            sortJson = { release_time: -1 }
            break;
        case '5':
            //排序升序
            sortJson = { sort: 1 }
            break;
        case '6':
            //排序降序
            sortJson = { sort: -1 };
            break;
    }

    let totalCount = await DB.getTotalCount('nav', {});
    let list = await DB.find('nav', {}, { 'sort': sortJson }, { pageIndex, pageSize });
    await ctx.render('admin/nav/index', { list, sortType, totalPage: Math.ceil(totalCount / pageSize), pageIndex });
}).get('/add', async (ctx) => {
    await ctx.render('admin/nav/add');
}).post('/doAdd', async (ctx) => {
    let title = ctx.request.body.title.trim(),
        status = ctx.request.body.status,
        url = ctx.request.body.url,
        add_time = tools.getTime(),
        edit_time = add_time,
        sort = 0,
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    let json = {
        title, status, url, sort, add_time, edit_time
    };

    let result = await DB.insert('nav', json);
    if (result.insertedCount > 0) {
        ctx.redirect(`${ctx.state.__ROOT__}/admin/nav`);
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/nav/add`
        });
    }
}).get('/edit', async (ctx) => {
    let _id = DB.getObjectId(ctx.query.id);
    let list = (await DB.find('nav', { _id }))[0];
    await ctx.render('admin/nav/edit', {
        list,
        prevPage: ctx.state.G.prevPage   /*保存上一页的值*/
    });
}).post('/doEdit', async (ctx) => {
    let prevPage = ctx.request.body.prevPage || '',
        id = ctx.request.body.id,
        title = ctx.request.body.title.trim(),
        status = ctx.request.body.status,
        url = ctx.request.body.url,
        edit_time = tools.getTime(),
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    let json = { title, status, url, edit_time };

    let result = await DB.update('nav', { _id: DB.getObjectId(id) }, json);
    if (result.modifiedCount > 0) {
        if (prevPage) {
            ctx.redirect(prevPage);
        } else {
            ctx.redirect(`${ctx.state.__ROOT__}/admin/nav`)
        }
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/nav/edit?id=${id}`
        });
    }
});


module.exports = router.routes();