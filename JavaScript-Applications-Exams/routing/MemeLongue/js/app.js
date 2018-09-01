$(() => {
    const app = new Sammy("#container", function () {
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
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/mainRegister.hbs');
            })
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let repeatPass = this.params.repeatPass;
            let email = this.params.email;
            let avatarUrl = this.params.avatarUrl;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Username should be at least 3 characters long and should contain only english alphabet letters!');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and should contain only english alphabet letters and digits!');
            } else if (password !== repeatPass) {
                notify.showError('Both passwords must match!');
            } else {
                auth.register(username, password, email, avatarUrl)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        notify.showInfo('User registration successful.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
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
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            })
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Username should be at least 3 characters long and should contain only english alphabet letters!');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and should contain only english alphabet letters and digits!');
            } else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        notify.showInfo('Login successful.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
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

        this.get('#/home', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            this.isAuth = isAuth;
            this.userId = sessionStorage.getItem('userId');

            memeService.allMemes()
                .then(function (memes) {
                    for (let meme of memes) {
                        meme.isOwner = sessionStorage.getItem('userId') === meme._acl.creator;
                    }
                    ctx.memes = memes;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesMeme: './templates/memeFeed/articlesMeme.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/memeFeed/mainMemeFeed.hbs');
                    })
                })
                .catch(notify.handleError);
        });

        this.get('#/createMeme', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            this.isAuth = isAuth;
            this.userId = sessionStorage.getItem('userId');

            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                createMemeForm: './templates/createMeme/createMemeForm.hbs'
            }).then(function () {
                this.partial('./templates/createMeme/mainCreateMeme.hbs');
            })
        });
        this.post('#/createMeme', function (ctx) {
            let title = this.params.title;
            let description = this.params.description;
            let imageUrl = this.params.imageUrl;
            let creator = sessionStorage.getItem('username');

            if (title.length > 33) {
                notify.showError('The title length must not exceed 33 characters!');
            } else if (description.length < 30 || description.length > 450) {
                notify.showError('The description length must not exceed 450 characters and should be at least 30!');
            } else if (!imageUrl.startsWith("http")) {
                notify.showError('Link url should always start with "http".');
            } else if (title.length === 0 || description.length === 0
                || imageUrl.length === 0){
                notify.showError('Fill all inputs!');
            } else {
                memeService.createMeme(creator, title, description, imageUrl)
                    .then(function () {
                        notify.showInfo('meme created.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/editMeme/:memeId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            this.isAuth = isAuth;
            this.userId = sessionStorage.getItem('userId');

            let memeId = this.params.memeId;

            memeService.currentMeme(memeId)
                .then(function (meme) {
                    ctx.meme = meme;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        formEditMeme: './templates/editMeme/formEditMeme.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editMeme/mainEditMeme.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.post('#/editMeme/:memeId', function (ctx) {
            let title = this.params.title;
            let description = this.params.description;
            let imageUrl = this.params.imageUrl;
            let creator = sessionStorage.getItem('username');

            let memeId = this.params.memeId;

            if (title.length > 33) {
                notify.showError('The title length must not exceed 33 characters!');
            } else if (description.length < 30 || description.length > 450) {
                notify.showError('The description length must not exceed 450 characters and should be at least 30!');
            } else if (!imageUrl.startsWith("http")) {
                notify.showError('Link url should always start with "http".');
            } else if (title.length === 0 || description.length === 0
                || imageUrl.length === 0){
                notify.showError('Fill all inputs!');
            } else {
                memeService.editMeme(memeId, creator, title, description, imageUrl)
                    .then(function () {
                        notify.showInfo(`Meme ${title} updated.`);
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/deleteMeme/:memeId', function (ctx) {
            let memeId = this.params.memeId;

            memeService.deleteMeme(memeId)
                .then(function () {
                    notify.showInfo(`Meme deleted.`);
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        });

        this.get('#/detailsMeme/:memeId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            this.isAuth = isAuth;
            this.userId = sessionStorage.getItem('userId');

            let memeId = this.params.memeId;

            memeService.currentMeme(memeId)
                .then(function (meme) {
                    meme.isOwner = sessionStorage.getItem('userId') === meme._acl.creator;
                    ctx.meme = meme;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/memeDetails/mainMemeDetails.hbs');
                    })
                })
                .catch(notify.handleError);
        });

        this.get('#/userProfile/:userId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            this.isAuth = isAuth;
            this.userId = sessionStorage.getItem('userId');

            let userId = this.params.userId;

            userService.getUserById(userId)
                .then(function (user) {
                    memeService.userMemes(user.username)
                        .then(function (memes) {
                            user.isOwner = sessionStorage.getItem('userId') === user._acl.creator;
                            ctx.user = user;
                            for (let meme of memes) {
                                meme.isMemeOwner = sessionStorage.getItem('userId') === meme._acl.creator;
                            }
                            ctx.memes = memes;
                            ctx.loadPartials({
                                nav: './templates/common/nav.hbs',
                                footer: './templates/common/footer.hbs',
                                articlesMeme: './templates/userProfile/articlesMeme.hbs'
                            }).then(function () {
                                ctx.partials = this.partials;
                                ctx.partial('./templates/userProfile/mainUserProfile.hbs');
                            })
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });
        this.get('#/deleteUser/:userId', function (ctx) {
            let userId = this.params.userId;

            userService.deleteUser(userId)
                .then(function () {
                    sessionStorage.clear();
                    notify.showInfo(`User deleted.`);
                    ctx.partials = this.partials;
                    ctx.redirect('#/index');
                })
                .catch(notify.handleError);
        });
		
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
    });
    app.run();
});