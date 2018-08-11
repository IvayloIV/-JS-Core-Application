$(() => {
    const app = new Sammy("#main", function () {
        this.use('Handlebars', 'hbs');
		
		this.get('index.html', welcomePage);
		this.get('#/index', welcomePage);

        this.get('#/register', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
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
            let repeatPass = this.params.repeatPass;

			auth.register(username, password)
				.then(function (userInfo) {
					auth.saveSession(userInfo);
					notify.showInfo('User registration successful.');
					ctx.partials = this.partials;
					ctx.redirect('#/home');
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
                header: './templates/common/header.hbs',
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
					notify.showInfo('Login successful.');
					ctx.partials = this.partials;
					ctx.redirect('#/home');
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
					notify.showInfo('Logout successful.');
                    ctx.partials = this.partials;
                    ctx.redirect('#/index');
                })
                .catch(notify.handleError)
        });
		
		function welcomePage(ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/index.hbs');
            });
        }
    });
    app.run();
});