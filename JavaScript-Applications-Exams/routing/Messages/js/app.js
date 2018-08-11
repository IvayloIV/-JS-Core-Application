$(() => {
    const app = new Sammy("#main", function () {
        this.use('Handlebars', 'hbs');
		
		this.get('index.html', welcomePage);
		this.get('#/index', welcomePage);
		function welcomePage(ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/index.hbs');
            });
        }

        this.get('#/register', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                formRegister: './templates/register/formRegister.hbs'
            }).then(function () {
                this.partial('./templates/register/mainRegister.hbs');
            })
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let name = this.params.name;

			auth.register(username, password, name)
				.then(function (userInfo) {
					auth.saveSession(userInfo);
					ctx.partials = this.partials;
					ctx.redirect('#/home');
					notify.showInfo('User registration successful.');
				})
				.catch(notify.handleError);
        });

        this.get('#/login', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                formLogin: './templates/login/formLogin.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            })
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

			auth.login(username, password)
				.then(function (userInfo) {
					auth.saveSession(userInfo);
					ctx.partials = this.partials;
					ctx.redirect('#/home');
					notify.showInfo('Login successful.');
				})
				.catch(notify.handleError);
        });

        this.get('#/logout', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.partials = this.partials;
                    ctx.redirect('#/index');
                    notify.showInfo('Logout successful.');
                })
                .catch(notify.handleError)
        });

        this.get('#/home', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/home/mainHome.hbs');
            })
        });
        this.get('#/myMessages', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            let username = sessionStorage.getItem('username');
            this.username = username;
            messagesService.myMessages(username)
                .then(function (myMessages) {
                    for (let myMessage of myMessages) {
                        myMessage.fullName = messagesService.formatSender(myMessage.sender_name, myMessage.sender_username);
                        myMessage.date = messagesService.formatDate(myMessage._kmd.ect)
                    }
                    ctx.messages = myMessages;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesMessages: './templates/myMessages/articleMessages.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myMessages/mainMyMessages.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/archiveSent', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            let username = sessionStorage.getItem('username');
            this.username = username;
            messagesService.listBySender(username)
                .then(function (messages) {
                    for (let message of messages) {
                        message.date = messagesService.formatDate(message._kmd.ect)
                    }
                    ctx.sentMessages = messages;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesArchiveSent: './templates/archiveSent/articlesArchiveSent.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/archiveSent/mainArchiveSent.hbs');
                    })
                })
                .catch(notify.handleError);
        });

        this.get('#/deleteSent/:id', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let id = this.params.id;
            messagesService.deleteMessage(id)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/archiveSent');
                    notify.showInfo('Message deleted.');
                })
                .catch(notify.handleError);
        });

        this.get('#/sendMessage', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            messagesService.listAllUser()
                .then(function (users) {
                    for (let user of users) {
                        if (user.name === ''){
                            user.name = null;
                        }
                        user.fullUsername = messagesService.formatSender(user.name, user.username);
                    }
                    ctx.users = users;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        formSendMessage: './templates/sendMessage/formSendMessage.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/sendMessage/mainSendMessage.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.post('#/sendMessage', function (ctx) {
            let username = $('#msgRecipientUsername option:selected').val();
            let text = this.params.text;

            messagesService.sendMessage(username, text)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/archiveSent');
                    notify.showInfo('Message sent.');
                })
                .catch(notify.handleError);
        });
    });
    app.run();
});