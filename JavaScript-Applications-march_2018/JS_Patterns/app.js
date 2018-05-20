let handlers = {};
$(() => {
    let app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/index.html', handlers.home);

        this.get('#/register.html', handlers.register);

        this.get('#/logout.html', function (ctx) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.redirect('#/index.html');
                    acceptBox('Success logout.');
                })
                .catch(console.error);
        });

        this.post('#/register.html', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPass = ctx.params.repeatPass;

            if (password !== repeatPass){
                errorBox("Different passwords.");
            } else {
                auth.register(username, password)
                    .then(function (user) {
                        auth.saveSession(user);
                        ctx.redirect('#/index.html');
                        acceptBox('Success register.');
                    })
                    .catch(function () {
                        errorBox('Invalid data.');
                    });
            }
        });

        this.post('#/index.html', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            auth.login(username, password)
                .then(function (user) {
                    auth.saveSession(user);
                    ctx.redirect('#/index.html');
                    acceptBox('Success login.');
                }).catch(function () {
                errorBox('Invalid data.');
            });
        });

    });
    app.run();
});