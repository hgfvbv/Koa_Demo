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

    let totalCount = await DB.getTotalCount('link', {});
    let list = await DB.find('link', {}, { 'sort': sortJson }, { pageIndex, pageSize });
    await ctx.render('admin/link/index', { list, sortType, totalPage: Math.ceil(totalCount / pageSize), pageIndex });
}).get('/add', async (ctx) => {
    await ctx.render('admin/link/add');
}).post('/doAdd', tools.multerInit('public/upload/link').single('pic'), async (ctx) => {
    //注意：一定要加上 upload.single('img_url')  否则取不到值
    //multer图片上传插件重置了post的取值方式，bodyparser失效，
    //需用multer指定的ctx.req.body取值，ctx.req.file.path获取上传好的图片路径

    let title = ctx.req.body.title.trim(),
        status = parseInt(ctx.req.body.status),
        url = ctx.req.body.url,
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        pic = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : '',  //   public\upload\1578206047179.jpg
        add_time = tools.getTime(),
        edit_time = add_time,
        sort = 0,
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    let json = {
        title, status, url, pic, sort, add_time, edit_time
    };

    let result = await DB.insert('link', json);
    if (result.insertedCount > 0) {
        ctx.redirect(`${ctx.state.__ROOT__}/admin/link`);
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/link/add`
        });
    }
}).get('/edit', async (ctx) => {
    let _id = DB.getObjectId(ctx.query.id);
    let list = (await DB.find('link', { _id }))[0];
    await ctx.render('admin/link/edit', {
        list,
        prevPage: ctx.state.G.prevPage   /*保存上一页的值*/
    });
}).post('/doEdit', tools.multerInit('public/upload/link').single('pic'), async (ctx) => {
    //注意：一定要加上 upload.single('img_url')  否则取不到值
    //multer图片上传插件重置了post的取值方式，bodyparser失效，
    //需用multer指定的ctx.req.body取值，ctx.req.file.path获取上传好的图片路径

    let prevPage = ctx.req.body.prevPage || '',
        id = ctx.req.body.id,
        title = ctx.req.body.title.trim(),
        status = parseInt(ctx.req.body.status),
        url = ctx.req.body.url,
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        pic = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : '',  //   public\upload\1578206047179.jpg
        edit_time = tools.getTime(),
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    let json = {};
    if (pic) {
        json = {
            title, status, url, pic, edit_time
        };
    } else {
        json = {
            title, status, url, edit_time
        };
    }
    let result = await DB.update('link', { _id: DB.getObjectId(id) }, json);
    if (result.modifiedCount > 0) {
        if (prevPage) {
            ctx.redirect(prevPage);
        } else {
            ctx.redirect(`${ctx.state.__ROOT__}/admin/link`)
        }
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/link/edit?id=${id}`
        });
    }
});


module.exports = router.routes();