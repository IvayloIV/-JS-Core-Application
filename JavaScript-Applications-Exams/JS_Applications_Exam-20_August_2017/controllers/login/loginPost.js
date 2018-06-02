handlers.loginPost = function (ctx) {
    let username = this.params.username;
    let password = this.params.password;
    if (!/^[A-Za-z]{3,}$/.test(username)){
        notify.showError('Invalid username.');
    } else if (!/^[A-Za-z0-9]{6,}$/.test(password)){
        notify.showError('Invalid password.');
    } else {
        auth.login(username, password)
            .then(function (userInfo) {
                auth.saveSession(userInfo);
                ctx.partials = this.partials;
                ctx.redirect('#/home');
                notify.showInfo('Login successful.');
            })
            .catch(notify.handleError);
    }
};