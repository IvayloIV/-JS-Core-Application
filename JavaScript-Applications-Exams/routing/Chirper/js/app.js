$(() => {
    const app = new Sammy("#main", function () {
        this.use('Handlebars', 'hbs');
		
		this.get('skeleton.html', welcomePage);
		this.get('#/login', welcomePage);
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (username.length < 5) {
                notify.showError('Too short username!');
            } else if (password === '') {
                notify.showError('Empty password!');
            } else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

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

            if (username.length < 5) {
                notify.showError('Too short username!');
            } else if (password === '') {
                notify.showError('Empty password!');
            } else if (password !== repeatPass) {
                notify.showError('Passwords does not match!');
            } else {
                auth.register(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        notify.showInfo('User registration successful.');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
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
                    notify.showInfo('Logout successful.');
                    ctx.redirect('#/login');
                })
                .catch(notify.handleError)
        });

        this.get('#/home', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let username = sessionStorage.getItem('username');
            ctx.username = username;
            Promise.all([chirpsService.getAllChirps(),
                chirpsService.countChirps(username),
                chirpsService.following(username),
                chirpsService.followers(username)])
                .then(function ([allChirps, countChirps, following, followers]) {
                    ctx.countChirps = countChirps.length;
                    let followingLenght = 0;
                    if (following[0]['subscriptions'] !== undefined) {
                        followingLenght = following[0]['subscriptions'].length;
                    }
                    ctx.following = followingLenght;
                    ctx.followers = followers.length;
                    for (let chirp of allChirps.sort((a, b) => new Date(b._kmd.ect) - new Date(a._kmd.ect))) {
                        chirp.data = chirpsService.calcTime(chirp._kmd.ect);
                        chirp.isOwner = chirp._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.chirps = allChirps;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        createChirp: './templates/home/formCreateChirp.hbs',
                        articleChirps: './templates/home/articleChirps.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/mainHome.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.post('#/createChirp', function (ctx) {
            let text = this.params.text;

            if (text === '') {
                notify.showError('Text is empty!');
            } else if (text.length > 150) {
                notify.showError('Max length on text is 150 symbols!');
            } else {
                chirpsService.createChirp(text)
                    .then(function () {
                        ctx.partials = this.partials;
                        notify.showInfo('Chirp published.');
                        ctx.redirect('#/myFeed');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/myFeed', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let username = sessionStorage.getItem('username');
            ctx.username = username;
            Promise.all([
                chirpsService.countChirps(username),
                chirpsService.following(username),
                chirpsService.followers(username)])
                .then(function ([countChirps, following, followers]) {
                    ctx.countChirps = countChirps.length;
                    let followingLenght = 0;
                    if (following[0]['subscriptions'] !== undefined) {
                        followingLenght = following[0]['subscriptions'].length;
                    }
                    ctx.following = followingLenght;
                    ctx.followers = followers.length;
                    for (let chirp of countChirps.sort((a, b) => new Date(b._kmd.ect) - new Date(a._kmd.ect))) {
                        chirp.data = chirpsService.calcTime(chirp._kmd.ect);
                        chirp.isOwner = chirp._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.chirps = countChirps;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        createChirp: './templates/home/formCreateChirp.hbs',
                        articleChirps: './templates/home/articleChirps.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myFeed/myFeedHome.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/deleteChirp/:chirpId', function (ctx) {
            let chirpId = this.params.chirpId;

            chirpsService.deleteChirp(chirpId)
                .then(function () {
                    ctx.partials = this.partials;
                    notify.showInfo('Chirp deleted.');
                    ctx.redirect('#/myFeed');
                })
                .catch(notify.handleError);
        });

        this.get('#/discover', function (ctx) {
            chirpsService.discoverPage()
                .then(function (users) {
                    let totalUsers = [];
                    for (let user of users) {
                        if (user._id === sessionStorage.getItem('userId')) {
                            continue;
                        }
                        user.followers = users.filter(a => {
                            return a['subscriptions'] !== undefined && a['subscriptions'].indexOf(user.username) !== -1;
                        }).length;
                        totalUsers.push(user);
                    }
                    ctx.users = totalUsers;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        articleUsers: './templates/discover/articleUsers.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/discover/mainDiscover.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/followPage/:username', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let username = this.params.username;
            if (sessionStorage.getItem('username') === username) {
                this.redirect('#/myFeed');
                return;
            }
            Promise.all([
                chirpsService.countChirps(username),
                chirpsService.following(username),
                chirpsService.followers(username)])
                .then(function ([countChirps, following, followers]) {
                    ctx.countChirps = countChirps.length;
                    let followingLenght = 0;
                    if (following[0]['subscriptions'] !== undefined) {
                        followingLenght = following[0]['subscriptions'].length;
                    }
                    ctx.username = username;
                    let currentSubs = JSON.parse(sessionStorage.getItem('subscriptions'));
                    ctx.isFollow = currentSubs.indexOf(username) === -1;
                    ctx.following = followingLenght;
                    ctx.followers = followers.length;
                    for (let chirp of countChirps.sort((a, b) => new Date(b._kmd.ect) - new Date(a._kmd.ect))) {
                        chirp.data = chirpsService.calcTime(chirp._kmd.ect);
                        chirp.isOwner = chirp._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.chirps = countChirps;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        articleChirps: './templates/home/articleChirps.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/followPage/mainFollowage.hbs');
                    })
                })
                .catch(notify.handleError);
        });

        this.get('#/follow/:username', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let username = this.params.username;
            chirpsService.follow(username)
                .then(function () {
                    notify.showInfo(`Subscribed to ${username}`);
                    ctx.partials = this.partials;
                    ctx.redirect(`#/followPage/${username}`);
                })
                .catch(notify.handleError);
        });
        this.get('#/unfollow/:username', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            let username = this.params.username;
            chirpsService.unFollow(username)
                .then(function () {
                    notify.showInfo(`Unsubscribed to ${username}`);
                    ctx.partials = this.partials;
                    ctx.redirect(`#/followPage/${username}`);
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
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            })
        }
    });
    app.run();
});