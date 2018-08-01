$(() => {
    const app = new Sammy("#main", function () {
        this.use('Handlebars', 'hbs');

        this.get('#/register', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/contacts');
                return;
            }
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                formRegister: './templates/register/formRegister.hbs'
            }).then(function () {
                this.partial('./templates/register/mainRegister.hbs');
            })
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let firstName = this.params.firstName;
            let lastName = this.params.lastName;
            let phone = this.params.phone;
            let currentEmail = this.params.currentEmail;

            auth.register(username, password, firstName, lastName, phone, currentEmail)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    ctx.partials = this.partials;
                    ctx.redirect('#/contacts');
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        this.get('#/login', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/contacts');
                return;
            }
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            })
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (username !== '' && password !== ''){
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        ctx.redirect('#/contacts');
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        });

        this.get('#/logout', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.partials = this.partials;
                    ctx.redirect('#/login');
                })
                .catch(function (err) {
                    console.log(err);
                })
        });

        this.get('#/contacts', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            contactService.showAllContacts()
                .then(function (users) {
                    ctx.users = users;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        articleContacts: './templates/contacts/articleContacts.hbs',
                        details: './templates/contacts/details.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/contacts/mainContacts.hbs');
                    });
                })
                .catch(function (err) {
                    console.log(err);
                })
        });
        this.get('#/currentContacts/:idContact', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let idContact = this.params.idContact;
            Promise.all([contactService.showAllContacts(), contactService.getCurrentContact(idContact)])
                .then(function ([users, currentContact]) {
                    ctx.users = users;
                    ctx.person = currentContact;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        articleContacts: './templates/contacts/articleContacts.hbs',
                        details: './templates/contacts/details.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/contacts/mainContacts.hbs');
                    })
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        this.get('#/editProfile', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let userId = sessionStorage.getItem('userId');
            contactService.getCurrentContact(userId)
                .then(function (user) {
                    ctx.user = user;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        editProfileForm: './templates/editProfile/editProfileForm.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editProfile/mainEditProfile.hbs');
                    });
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
        this.post('#/editProfile/:userId', function (ctx) {
            let firstName = this.params.firstName;
            let lastName = this.params.lastName;
            let phone = this.params.phone;
            let currentEmail = this.params.currentEmail;
            let userId = this.params.userId;

            contactService.updateUser(userId, firstName, lastName, phone, currentEmail)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/contacts');
                })
                .catch(function (err) {
                    console.log(err);
                });

        });
    });
    app.run();
});