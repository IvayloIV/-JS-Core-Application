handlers.registerPost = function (ctx) {
    let username = this.params.username;
    let password = this.params.password;
    let repeatPass = this.params.repeatPass;
    if (!/^[A-Za-z]{3,}$/.test(username)){
        notify.showError('Invalid username.');
    } else if (!/^[A-Za-z0-9]{6,}$/.test(password)){
        notify.showError('Invalid password.');
    } else if (password !== repeatPass){
        notify.showError('The passwords not match.');
    } else {
        auth.register(username, password)
            .then(function (userInfo) {
                auth.saveSession(userInfo);
                ctx.partials = this.partials;
                ctx.redirect('#/home');
                notify.showInfo('User registration successful.');
            })
            .catch(notify.handleError);
    }
};