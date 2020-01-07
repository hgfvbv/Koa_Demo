const router = require('koa-router')(),
    validator = require('validator'),
    tools = require('../../model/tools'),
    DB = require('../../model/dbHelper');

router.get('/', async (ctx) => {
    let list = (await DB.find('setting', {}))[0];
    await ctx.render('admin/setting/index', { list });
}).post('/doEdit', tools.multerInit('public/upload/setting').single('site_logo'), async (ctx) => {
    let site_title = ctx.req.body.site_title,
        imgPath = ctx.req.file ? ctx.req.file.path : '',
        site_logo = imgPath ? imgPath.substr(imgPath.indexOf('\\') + 1) : '',
        site_keywords = ctx.req.body.site_keywords,
        site_description = ctx.req.body.site_description,
        site_icp = ctx.req.body.site_icp,
        site_qq = ctx.req.body.site_qq,
        site_tel = ctx.req.body.site_tel,
        site_address = ctx.req.body.site_address,
        site_status = ctx.req.body.site_status,
        edit_time = tools.getTime();

    let json = {};
    if (site_logo) {
        json = {
            site_title, site_logo, site_keywords, site_description, site_icp, site_qq, site_tel, site_address, site_status, edit_time
        }
    } else {
        json = {
            site_title, site_keywords, site_description, site_icp, site_qq, site_tel, site_address, site_status, edit_time
        }
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