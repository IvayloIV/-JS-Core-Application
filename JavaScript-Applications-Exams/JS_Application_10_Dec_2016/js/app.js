$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/index', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/indexView.hbs');
            });
        });

        this.get('#/register', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
                form: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/mainRegister.hbs');
            });
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let name = this.params.name;
            auth.register(username, password, name)
                .then(function (user) {
                    auth.saveSession(user);
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                    notify.showInfo('User registration successful.');
                }).catch(notify.handleError);
        });

        this.get('#/login', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
                form: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            });
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            auth.login(username, password)
                .then(function (user) {
                    auth.saveSession(user);
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                    notify.showInfo('Login successful.');
                }).catch(notify.handleError);
        });

        this.get('#/logout', function (ctx) {
            auth.logout()
                .then(function () {
                   sessionStorage.clear();
                   ctx.partials = this.partials;
                   ctx.redirect('#/index');
                   notify.showInfo('Logout successful.');
                });
        });

        this.get('#/home', function (ctx) {
            let isAuth = auth.isAuth();
            if (!isAuth){
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username =  sessionStorage.getItem('username');
            this.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/homePage/mainHome.hbs');
            });
        });

        this.get('#/myMessages', function (ctx) {
            let isAuth = auth.isAuth();
            if (!isAuth){
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            let username = sessionStorage.getItem('username');
            this.username =  username;
            message.myMessages(username)
                .then(function (allMessages) {
                    for (let allMessage of allMessages) {
                        allMessage.from = message.formatSender(allMessage.sender_name, allMessage.sender_username);
                        allMessage.data = message.formatDate(allMessage._kmd.ect);
                    }
                    ctx.messages = allMessages;
                    ctx.loadPartials({
                        navigation: './templates/common/navigation.hbs',
                        footer: './templates/common/footer.hbs',
                        table: './templates/myMessages/tableOfMessages.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myMessages/mainViewMessage.hbs');
                    });
                }).catch(notify.handleError);
        });

        this.get('#/sendMessage', function (ctx) {
            let isAuth = auth.isAuth();
            if (!isAuth){
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username =  sessionStorage.getItem('username');
            message.allUsers()
                .then(function (users) {
                    for (let user of users) {
                        let currentName = user.name;
                        if (currentName === ''){
                            currentName = null;
                        }
                        user.currentName = message.formatSender(currentName, user.username);
                    }
                    ctx.users = users;
                    ctx.loadPartials({
                        navigation: './templates/common/navigation.hbs',
                        footer: './templates/common/footer.hbs',
                        loadNames: './templates/sendMessage/allNames.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/sendMessage/mainSendMessage.hbs');
                    });
                });
        });
        this.post('#/sendMessage', function (ctx) {
            let sender_username = sessionStorage.getItem('username');
            let sender_name = sessionStorage.getItem('userName');
            if (sender_name === ''){
                sender_name = null;
            }
            let recipient_username = this.params.recipient;
            let text = this.params.text;
            message.sendMessage(sender_username, sender_name, recipient_username, text)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/archiveMessages');
                    notify.showInfo('Message sent.');
                }).catch(notify.handleError);
        });

        this.get('#/archiveMessages', function (ctx) {
            let isAuth = auth.isAuth();
            if (!isAuth){
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username =  sessionStorage.getItem('username');
            message.archiveMessages(this.username)
                .then(function (messages) {
                    for (let currentMessage of messages) {
                        currentMessage.data = message.formatDate(currentMessage._kmd.ect);
                    }
                    ctx.archiveMessages = messages;
                    ctx.loadPartials({
                        navigation: './templates/common/navigation.hbs',
                        footer: './templates/common/footer.hbs',
                        table: './templates/archiveMessages/tableMessages.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/archiveMessages/indexArchive.hbs');
                    });
                }).catch(notify.handleError);
        });

        this.get('#/delete/:idMessage', function (ctx) {
            let id = this.params.idMessage;
            message.deleteMessages(id)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/archiveMessages');
                    notify.showInfo('Message deleted.');
                }).catch(notify.handleError);
        });
    });
    app.run();
});