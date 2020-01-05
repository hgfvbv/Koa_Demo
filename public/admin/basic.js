var app = {
    toggle: function (element, collectionName, attr, id) {
        $.post('/admin/changeStatus', { collectionName, attr, id }, function (data) {
            if (data.success) {
                if (element.src.indexOf('yes') == -1) {
                    element.src = '/admin/images/yes.gif';
                } else {
                    element.src = '/admin/images/no.gif';
                }
            } else {
                alert(data.message);
            }
        });
    }, delete: function (collectionName, id) {
        if (confirm('您确定要删除吗？')) {
            $.post('/admin/remove', { collectionName, id }, function (data) {
                if (data.success) {
                    if (data.prevPage != '') {
                        location.href = data.prevPage;
                    } else {
                        if (collectionName == 'admin') {
                            location.href = '/admin/manage';
                        } else {
                            location.href = '/admin/' + collectionName;
                        }
                    }
                } else {
                    alert(data.message);
                }
            });
        }
    }, changeSort: function (element, collectionName, id) {
        $.post('/admin/changeSort', { collectionName, id, sort: element.value }, function (data) {
            // if (data.success) {   //会引起死循环
            //     if (data.prevPage != '' && data.prevPage != undefined) {
            //         location.href = data.prevPage;
            //     }
            // } else {
            //     //alert(data.message);
            //     if (data.prevPage != '' && data.prevPage != undefined) {
            //         location.href = data.prevPage;
            //     } else {
            //         location.href = '/admin/article';
            //     }
            // }
            if (!data.success) {
                // alert(data.message);
            }
        });
    }
};