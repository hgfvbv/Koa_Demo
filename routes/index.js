const router = require('koa-router')(),
    url = require('url'),
    DB = require('../model/dbHelper');

router.use(async (ctx, next) => {
    ctx.state.setting = (await DB.find('setting', {}))[0];
    ctx.state.link = await DB.find('link', { 'status': 1 }, { 'attr': { url: 1, title: 1 }, 'sort': { sort: 1 } });
    ctx.state.pathname = url.parse(ctx.request.url).pathname;
    ctx.state.navs = await DB.find('nav', { 'status': 1 }, { 'sort': { sort: 1 }, 'attr': { 'title': 1, 'url': 1 } });
    await next();
});

router.get('/', async (ctx) => {

    let focus = await DB.find('focus', { 'status': 1 }, { 'sort': { sort: 1 }, 'attr': { 'title': 1, 'url': 1, 'pic': 1 } });
    ctx.render('default/index', { focus });

});

router.get('/service', async (ctx) => {
    let serviceSeo = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId('5ab34b61c1348e1148e9b8c2') }, { 'attr': { 'title': 1, 'keywords': 1, 'description': 1 } });
    let services = await DB.find('article', { 'status': 1, 'pid': '5ab34b61c1348e1148e9b8c2' }, { 'sort': { sort: 1 }, 'attr': { 'title': 1, 'img_url': 1, '_id': 1 } });
    ctx.render('default/service', { services, serviceSeo: serviceSeo[0] });
});

router.get('/content/:id', async (ctx) => {
    let content = await DB.find('article', { 'status': 1, '_id': DB.getObjectId(ctx.params.id) }, { 'attr': { 'pid': 1, 'title': 1, 'content': 1, 'keywords': 1, 'description': 1 } });

    let articlecate = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId(content[0].pid) });
    let navResult = {};
    if (articlecate[0].pid != 0) {
        articlecateParent = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId(articlecate[0].pid) });
        navResult = await DB.find('nav', { 'status': 1, $or: [{ 'title': articlecate[0].title }, { 'title': articlecateParent[0].title }] }, { 'attr': { 'url': 1 } });
    } else {
        navResult = await DB.find('nav', { 'status': 1, 'title': articlecate[0].title }, { 'attr': { 'url': 1 } });
    }
    if (navResult.length > 0) {
        ctx.state.pathname = navResult[0].url;
    } else {
        ctx.state.pathname = '/';
    }
    ctx.render('default/content', { content: content[0] });
});

router.get('/case', async (ctx) => {
    let pid = ctx.query.pid,
        pageIndex = ctx.query.pageIndex || 1,
        pageSize = 3;

    //获取成功案例下面的分类
    let cateResult = await DB.find('articlecate', { 'pid': '5ab3209bdf373acae5da097e' }),
        articleResult = {},
        totalCount = 0;

    let serviceSeo = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId('5ab3209bdf373acae5da097e') }, { 'attr': { 'title': 1, 'keywords': 1, 'description': 1 } });

    let articlecateParent = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId('5ab3209bdf373acae5da097e') }, { 'attr': { 'title': 1 } });
    let navResult = await DB.find('nav', { 'status': 1, 'title': articlecateParent[0].title }, { 'attr': { 'url': 1 } });
    ctx.state.pathname = navResult[0].url;

    if (pid) {
        articleResult = await DB.find('article', { 'status': 1, pid }, { 'attr': { '_id': 1, 'img_url': 1, 'title': 1 }, 'sort': { 'sort': 1 } }, { pageIndex, pageSize });
        totalCount = await DB.getTotalCount('article', { 'status': 1, pid });
    } else {
        let subCateArr = [];
        for (let i = 0; i < cateResult.length; i++) {
            subCateArr.push(cateResult[i]._id.toString());
        }
        articleResult = await DB.find('article', { 'status': 1, 'pid': { $in: subCateArr } }, { 'attr': { '_id': 1, 'img_url': 1, 'title': 1 }, 'sort': { 'sort': 1 } }, { pageIndex, pageSize });
        totalCount = await DB.getTotalCount('article', { 'status': 1, 'pid': { $in: subCateArr } });
    }
    ctx.render('default/case', {
        serviceSeo: serviceSeo[0],
        catelist: cateResult,
        articlelist: articleResult,
        pid,
        totalPage: Math.ceil(totalCount / pageSize),
        pageIndex
    });
});

router.get('/news', async (ctx) => {
    let pid = ctx.query.pid,
        pageIndex = ctx.query.pageIndex || 1,
        pageSize = 3;

    let catelist = await DB.find('articlecate', { 'status': 1, 'pid': '5afa56bb416f21368039b05d' }),
        articleResult = {},
        totalCount = 0;

    let serviceSeo = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId('5afa56bb416f21368039b05d') }, { 'attr': { 'title': 1, 'keywords': 1, 'description': 1 } });

    let articlecateParent = await DB.find('articlecate', { 'status': 1, '_id': DB.getObjectId('5afa56bb416f21368039b05d') }, { 'attr': { 'title': 1 } });
    let navResult = await DB.find('nav', { 'status': 1, 'title': articlecateParent[0].title }, { 'attr': { 'url': 1 } });
    ctx.state.pathname = navResult[0].url;

    if (pid) {
        articleResult = await DB.find('article', { 'status': 1, pid }, { 'attr': { '_id': 1, 'img_url': 1, 'title': 1 }, 'sort': { 'sort': 1 } }, { pageIndex, pageSize });
        totalCount = await DB.getTotalCount('article', { 'status': 1, pid });
    } else {
        let subCateArr = [];
        for (let i = 0; i < catelist.length; i++) {
            subCateArr.push(catelist[i]._id.toString());
        }
        articleResult = await DB.find('article', { 'status': 1, 'pid': { $in: subCateArr } }, { 'attr': { '_id': 1, 'img_url': 1, 'title': 1 }, 'sort': { 'sort': 1 } }, { pageIndex, pageSize });
        totalCount = await DB.getTotalCount('article', { 'status': 1, 'pid': { $in: subCateArr } });
    }
    ctx.render('default/news', {
        serviceSeo: serviceSeo[0],
        catelist,
        articlelist: articleResult,
        pid,
        totalPage: Math.ceil(totalCount / pageSize),
        pageIndex
    });
});

router.get('/about', async (ctx) => {

    ctx.render('default/about', {});

});

router.get('/connect', async (ctx) => {

    ctx.render('default/connect', {});

});

module.exports = router.routes();