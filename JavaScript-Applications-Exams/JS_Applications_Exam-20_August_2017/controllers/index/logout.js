handlers.logoutPost = function (ctx) {
    auth.logout()
        .then(function () {
            sessionStorage.clear();
            ctx.partials = this.partials;
            ctx.redirect('#/index');
            notify.showInfo('Logout successful.');
        })
        .catch(notify.handleError);
};