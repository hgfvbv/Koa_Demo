const router = require('koa-router')(),
    validator = require('validator'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');

router.get('/', async (ctx) => {
    let list = (await DB.find('setting', {}))[0];
    await ctx.render('admin/setting/index', { list });
}).post('/doEdit', tools.multerInit('public/upload/setting').fields([{ name: 'site_ico' }, { name: 'site_logo' }]), async (ctx) => {
    let site_title = ctx.req.body.site_title,
        imgIcoPath = ctx.req.files['site_ico'] ? ctx.req.files['site_ico'][0].path : '',
        site_ico = imgIcoPath ? imgIcoPath.substr(imgIcoPath.indexOf('\\')) : '',
        imgPath = ctx.req.files['site_logo'] ? ctx.req.files['site_logo'][0].path : '',
        site_logo = imgPath ? imgPath.substr(imgPath.indexOf('\\')) : '',
        site_keywords = ctx.req.body.site_keywords,
        site_description = ctx.req.body.site_description,
        site_icp = ctx.req.body.site_icp,
        site_policeIcp = ctx.req.body.site_policeIcp,
        site_qq = ctx.req.body.site_qq,
        site_tel = ctx.req.body.site_tel,
        site_address = ctx.req.body.site_address,
        site_status = parseInt(ctx.req.body.site_status),
        edit_time = tools.getTime();

    let json = {
        site_title, site_keywords, site_description, site_icp, site_policeIcp, site_qq, site_tel, site_address, site_status, edit_time
    };

    if (site_ico) {
        json.site_ico = site_ico;
    }

    if (site_logo) {
        json.site_logo = site_logo;
    }

    let result = await DB.update('setting', {}, json);
    if (result.modifiedCount > 0) {
        ctx.redirect(`${ctx.state.__ROOT__}/admin/setting`);
    } else {
        await ctx.render('admin/error', {
            msg: '对不起！服务器异常！请稍后再试！',
            redirect: `${ctx.state.__ROOT__}/admin/setting`
        });
    }
});

module.exports = router.routes();