var func = {
    getTime: function() {
        var now = new Date(),
            year = now.getFullYear(),
            month = now.getMonth()+1,
            day = now.getDate(),
            hours = now.getHours(),
            minutes = now.getMinutes(),
            seconds = now.getSeconds();
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    },
    getUser: function(user, users) {
        var user_id = user.user_id;
        var index = -1;
        users.forEach(function(item, idx) {
            if(item.user_id == user_id){
                index = idx;
            }
        });
        return index;
    }
}

module.exports = func;