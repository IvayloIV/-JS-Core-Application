handlers.index = function (ctx) {
    if (auth.isAuth()){
        this.redirect('#/home');
        return;
    }
    this.loadPartials({
        header : './templates/common/header.hbs',
        footer : './templates/common/footer.hbs',
        loginForm : './templates/login/loginForm.hbs',
        registerForm : './templates/register/registerForm.hbs'
    }).then(function () {
        this.partial('./templates/index.hbs');
    });
};