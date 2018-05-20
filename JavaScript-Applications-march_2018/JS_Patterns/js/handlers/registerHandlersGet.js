handlers.register = function () {
    this.isAuth = auth.isAuth();
    if (this.isAuth === true){
        this.redirect('#/index.html');
        return
    }
    this.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        navbar: './templates/common/navbar.hbs'
    }).then(function () {
        this.partial('./templates/forms/register.hbs');
    });
};