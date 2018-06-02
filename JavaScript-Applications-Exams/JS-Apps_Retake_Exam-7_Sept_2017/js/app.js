$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/login', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                header : './templates/common/header.hbs',
                footer : './templates/common/footer.hbs',
                formLogin : './templates/login/formLogin.hbs'
            }).then(function () {
                this.partial('./templates/login/indexLogin.hbs');
            });
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            if (username.length < 5){
                notify.showError('The username should be at least 5 symbols.');
            } else if (password === '') {
                notify.showError('The password is empty.');
            }  else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        $('#formLogin').trigger('reset');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Login successful.');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/register', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                header : './templates/common/header.hbs',
                footer : './templates/common/footer.hbs',
                formRegister : './templates/register/formRegister.hbs'
            }).then(function () {
                this.partial('./templates/register/indexRegister.hbs');
            });
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let repeatPass = this.params.repeatPass;
            if (username.length < 5){
                notify.showError('The username should be at least 5 symbols.');
            } else if (password === '') {
                notify.showError('The password is empty.');
            } else if (password !== repeatPass) {
                notify.showError('The passwords not match.');
            } else {
                auth.register(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        $('#formRegister').trigger('reset');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('User registration successful.');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/logout', function (ctx) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.partials = this.partials;
                    ctx.redirect('#/login');
                    notify.showInfo('Logout successful.');
                })
                .catch(notify.handleError);
        });

        this.get('#/home', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/login');
                return;
            }
            let subs = sessionStorage.getItem('subscriptions');
            let username = sessionStorage.getItem('username');
            
            Promise.all([chirps.countChirps(username),
                chirps.followers(username),
                chirps.following(username),
                chirps.allChirps(subs)])
                .then(function ([chirpsS, followers, following, allChirps]) {
                    for (let chirp of allChirps) {
                        chirp.date = chirps.calcTime(chirp._kmd.ect);
                    }
                    let totalFollowing = 0;
                    let sub = following[0]['subscriptions'];
                    if (sub !== undefined){
                        totalFollowing = sub.length;
                    }
                    ctx.currentChips = chirpsS.length;
                    ctx.following = totalFollowing;
                    ctx.followers = followers.length;
                    ctx.chirps = allChirps;
                    ctx.username = username;
                    ctx.loadPartials({
                        header : './templates/common/header.hbs',
                        footer : './templates/common/footer.hbs',
                        navigation : './templates/common/navigation.hbs',
                        chirpsForm : './templates/home/chirpsForm.hbs',
                        chirps : './templates/home/chirps.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/indexHome.hbs');
                    });
                }).catch(notify.handleError);
        });
        this.post('#/createChirps', function (ctx) {
            let author = sessionStorage.getItem('username');
            let text = this.params.text;
            if (text === ''){
                notify.showError('Text is empty.')
            } else if (text.length > 150){
                notify.showError('Too long text.')
            } else {
                chirps.createChirps(text, author)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/myChirps');
                        notify.showInfo('Chirp published.');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/myChirps', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/login');
                return;
            }
            let username = sessionStorage.getItem('username');

            Promise.all([chirps.countChirps(username),
                chirps.followers(username),
                chirps.following(username),
                chirps.myChirps(username)])
                .then(function ([chirpsS, followers, following, allChirps]) {
                    for (let chirp of allChirps) {
                        chirp.date = chirps.calcTime(chirp._kmd.ect);
                    }
                    let totalFollowing = 0;
                    let sub = following[0]['subscriptions'];
                    if (sub !== undefined){
                        totalFollowing = sub.length;
                    }
                    ctx.currentChips = chirpsS.length;
                    ctx.following = totalFollowing;
                    ctx.followers = followers.length;
                    ctx.chirps = allChirps;
                    ctx.username = username;
                    ctx.loadPartials({
                        header : './templates/common/header.hbs',
                        footer : './templates/common/footer.hbs',
                        navigation : './templates/common/navigation.hbs',
                        chirpsForm : './templates/home/chirpsForm.hbs',
                        myChirps : './templates/myChirps/myChirps.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myChirps/indexMyChirps.hbs');
                    });
                }).catch(notify.handleError);
        });
        this.get('#/delete/:id', function (ctx) {
            let id = this.params.id;
            chirps.deleteChirps(id)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/myChirps');
                    notify.showInfo('Chirp deleted.');
                }).catch(notify.handleError);
        });

        this.get('#/discover', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/login');
                return;
            }
            chirps.discover()
                .then(function (users) {
                    let result = [];
                    for (let user of users) {
                        if (user._id === sessionStorage.getItem('userId')){
                            continue;
                        }
                        user.hisUsername = user.username;
                        user.totalFollowers = users.filter(a => {
                            return !!(a['subscriptions'] !== undefined && a['subscriptions'].includes(user.username));
                        }).length;
                        result.push(user);
                    }
                    ctx.users = result;
                    ctx.loadPartials({
                        header : './templates/common/header.hbs',
                        footer : './templates/common/footer.hbs',
                        navigation : './templates/common/navigation.hbs',
                        users : './templates/discover/users.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/discover/indexDiscover.hbs');
                    });
                }).catch(notify.handleError);
        });
        this.get('#/followPage/:username', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/login');
                return;
            }
            let username = this.params.username;
            if (sessionStorage.getItem('username') === username){
                this.redirect('#/myChirps');
                return;
            }

            Promise.all([chirps.countChirps(username),
                chirps.followers(username),
                chirps.following(username),
                chirps.myChirps(username)])
                .then(function ([chirpsS, followers, following, allChirps]) {
                    for (let chirp of allChirps) {
                        chirp.date = chirps.calcTime(chirp._kmd.ect);
                    }
                    let totalFollowing = 0;
                    let sub = following[0]['subscriptions'];
                    if (sub !== undefined){
                        totalFollowing = sub.length;
                    }
                    ctx.isFollowHim = sessionStorage.getItem('subscriptions').includes(username);
                    ctx.currentChips = chirpsS.length;
                    ctx.following = totalFollowing;
                    ctx.followers = followers.length;
                    ctx.chirps = allChirps;
                    ctx.username = username;
                    ctx.loadPartials({
                        header : './templates/common/header.hbs',
                        footer : './templates/common/footer.hbs',
                        navigation : './templates/common/navigation.hbs',
                        articles : './templates/follow/formChirps.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/follow/indexFollow.hbs');
                    });
                }).catch(notify.handleError);
        });

        this.get('#/follow/:username', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/login');
                return;
            }
            let username = this.params.username;
            if (sessionStorage.getItem('username') === username){
                this.redirect('#/myChirps');
                return;
            }

            chirps.follow(sessionStorage.getItem('userId'), username)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect(`#/followPage/${username}`);
                    notify.showInfo(`Subscribed to ${username}`);
                }).catch(notify.handleError);
        });
        this.get('#/unfollow/:username', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/login');
                return;
            }
            let username = this.params.username;
            if (sessionStorage.getItem('username') === username){
                this.redirect('#/myChirps');
                return;
            }

            chirps.unfollow(sessionStorage.getItem('userId'), username)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect(`#/followPage/${username}`);
                    notify.showInfo(`Unsubscribed to ${username}`);
                }).catch(notify.handleError);
        });
    });
    app.run();
});