handlers.createPostGet = function (ctx) {
    if (!auth.isAuth()){
        this.redirect('#/index');
        return;
    }
    this.isAuth = sessionStorage.getItem('authtoken');
    this.username = sessionStorage.getItem('username');
    this.loadPartials({
        header : './templates/common/header.hbs',
        footer : './templates/common/footer.hbs',
        navigation : './templates/common/navigation.hbs',
        createForm : './templates/createPost/createForm.hbs'
    }).then(function () {
        this.partial('./templates/createPost/indexCreate.hbs');
    });
};