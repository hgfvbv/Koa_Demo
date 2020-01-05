const router = require('koa-router')(),
    validator = require('validator'),
    multer = require('koa-multer'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let path = 'public/upload/article';
        fs.exists(path, (exists) => {
            if (!exists) {
                mkdirp(path, (err) => {
                    if (err) {
                        console.log(`后台警告：增加内容创建上传图片文件夹错误！ ${err}`);
                    } else {
                        cb(null, path);   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
                    }
                });
            } else {
                cb(null, path);   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
            }
        });
    },
    filename: (req, file, cb) => {   /*图片上传完成重命名*/
        let fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
        cb(null, `${Date.now()}.${fileFormat[fileFormat.length - 1]}`);
    }
});
var upload = multer({ storage });

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

    let totalCount = await DB.getTotalCount('article', {});
    let list = await DB.find('article', {}, { 'sort': sortJson }, { pageIndex, pageSize });
    await ctx.render('admin/article/index', { list, sortType, totalPage: Math.ceil(totalCount / pageSize), pageIndex });
}).get('/add', async (ctx) => {
    let data = await DB.find('articlecate', {});
    await ctx.render('admin/article/add', { catelist: tools.cateToList(data) });
}).post('/doAdd', upload.single('img_url'), async (ctx) => {
    //注意：一定要加上 upload.single('img_url')  否则取不到值
    //multer图片上传插件重置了post的取值方式，bodyparser失效，
    //需用multer指定的ctx.req.body取值，ctx.req.file.path获取上传好的图片路径

    let pid = ctx.req.body.pid,
        catename = ctx.req.body.catename.trim(),
        title = ctx.req.body.title.trim(),
        author = ctx.req.body.author.trim(),
        status = ctx.req.body.status,
        is_best = ctx.req.body.is_best || '0',
        is_hot = ctx.req.body.is_hot || '0',
        is_new = ctx.req.body.is_new || '0',
        keywords = ctx.req.body.keywords,
        description = ctx.req.body.description || '',
        content = ctx.req.body.content || '',
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        img_url = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : '',  //   public\upload\1578206047179.jpg
        add_time = tools.getTime(),
        release_time = add_time,
        sort = 0,
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    let json = {
        pid, catename, title, author, status, is_best, is_hot, is_new, keywords, description, content, img_url, sort, add_time, release_time
    };

    let result = await DB.insert('article', json);
    if (result.insertedCount > 0) {
        ctx.redirect(`${ctx.state.__ROOT__}/admin/article`);
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/article/add`
        });
    }
}).get('/edit', async (ctx) => {
    let _id = DB.getObjectId(ctx.query.id);
    let list = (await DB.find('article', { _id }))[0];
    let data = await DB.find('articlecate', {});
    await ctx.render('admin/article/edit', {
        list,
        catelist: tools.cateToList(data),
        prevPage: ctx.state.G.prevPage   /*保存上一页的值*/
    });
}).post('/doEdit', upload.single('img_url'), async (ctx) => {
    //注意：一定要加上 upload.single('img_url')  否则取不到值
    //multer图片上传插件重置了post的取值方式，bodyparser失效，
    //需用multer指定的ctx.req.body取值，ctx.req.file.path获取上传好的图片路径

    let prevPage = ctx.req.body.prevPage || '',
        id = ctx.req.body.id,
        pid = ctx.req.body.pid,
        catename = ctx.req.body.catename.trim(),
        title = ctx.req.body.title.trim(),
        author = ctx.req.body.author.trim(),
        status = ctx.req.body.status,
        is_best = ctx.req.body.is_best || '0',
        is_hot = ctx.req.body.is_hot || '0',
        is_new = ctx.req.body.is_new || '0',
        keywords = ctx.req.body.keywords,
        description = ctx.req.body.description || '',
        content = ctx.req.body.content || '',
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        img_url = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : '',  //   public\upload\1578206047179.jpg
        release_time = tools.getTime(),
        flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");

    let json = {};
    if (img_url) {
        json = {
            pid, catename, title, author, status, is_best, is_hot, is_new, keywords, description, img_url, content, release_time
        };
    } else {
        json = {
            pid, catename, title, author, status, is_best, is_hot, is_new, keywords, description, content, release_time
        };
    }
    let result = await DB.update('article', { _id: DB.getObjectId(id) }, json);
    if (result.modifiedCount > 0) {
        if (prevPage) {
            ctx.redirect(prevPage);
        } else {
            ctx.redirect(`${ctx.state.__ROOT__}/admin/article`)
        }
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/article/edit?id=${id}`
        });
    }
});


module.exports = router.routes();