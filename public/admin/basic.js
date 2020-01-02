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
    }
};