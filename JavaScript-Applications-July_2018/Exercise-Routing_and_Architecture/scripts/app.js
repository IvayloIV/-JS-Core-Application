$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/home', function (ctx) {
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.hasTeam = sessionStorage.getItem('teamId') !== 'undefined';
            this.teamId = sessionStorage.getItem('teamId');
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/home/home.hbs');
            });
        });
        this.get('#/about', function (ctx) {
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/about/about.hbs');
            });
        });

        this.get('#/register', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = isAuth;
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            })
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let repeatPassword = this.params.repeatPassword;

            if (username === '' || password === ''){
                auth.showError('Fill inputs.');
            } else if (repeatPassword !== password) {
                auth.showError('Passwords are different.');
            } else {
                auth.register(username, password, repeatPassword)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        auth.showInfo('Register success.');
                    })
                    .catch(auth.handleError);
            }
        });

        this.get('#/login', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = isAuth;
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            })
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (username === '' || password === ''){
                auth.showError('Fill inputs.');
            } else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        auth.showInfo('Login successful.');
                    })
                    .catch(auth.handleError);
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
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                    auth.showInfo('Logout success.');
                })
                .catch(auth.handleError);
        });
        this.get('#/catalog', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            this.hasNoTeam = sessionStorage.getItem('teamId') === 'undefined';
            teamsService.loadTeams()
                .then(function (totalTeams) {
                    totalTeams.sort((a, b) => new Date(b._kmd.ect) - new Date(a._kmd.ect));
                    ctx.teams = totalTeams;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        team: './templates/catalog/team.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/catalog/teamCatalog.hbs');
                    })
                })
                .catch(auth.showError);
        });

        this.get('#/create', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs'
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            })
        });
        this.post('#/create', function (ctx) {
            let name = this.params.name;
            let comment = this.params.comment;

            if (name === ''){
                auth.showError('Fill name.');
            } else {
                teamsService.createTeam(name, comment)
                    .then(function (team) {
                        teamsService.joinTeam(team._id)
                            .then(function (userInfo) {
                                auth.saveSession(userInfo);
                                ctx.partials = this.partials;
                                ctx.redirect('#/catalog');
                                auth.showInfo('New team was created.');
                            }).catch(auth.handleError);
                    })
                    .catch(auth.handleError);
            }
        });

        this.get('#/catalog/:id', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            this.hasNoTeam = sessionStorage.getItem('teamId') === 'undefined';
            let teamId = this.params.id;
            teamsService.loadTeamDetails(teamId)
                .then(function (team) {
                    auth.getAllUsers()
                        .then(function (users) {
                            ctx.name = team.name;
                            ctx.comment = team.comment;
                            ctx.teamId = teamId;
                            ctx.isAuthor = sessionStorage.getItem('userId') === team._acl.creator;
                            ctx.isOnTeam = sessionStorage.getItem('teamId') === team._id;
                            ctx.members = users.filter(a => a.teamId === team._id);
                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                teamMember: './templates/catalog/teamMember.hbs',
                                teamControls: './templates/catalog/teamControls.hbs'
                            }).then(function () {
                                ctx.partials = this.partials;
                                ctx.partial('./templates/catalog/details.hbs');
                            })

                        }).catch(auth.handleError)
                })
                .catch(auth.handleError);
        });
        this.get('#/leave', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            teamsService.leaveTeam()
                .then(function () {
                    sessionStorage.setItem('teamId', 'undefined');
                    ctx.partials = this.partials;
                    ctx.redirect('#/catalog');
                    auth.showInfo('Leave team success.');
                })
                .catch(auth.handleError);
        });
        this.get('#/join/:idTeam', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            let teamId = this.params.idTeam;
            teamsService.joinTeam(teamId)
                .then(function () {
                    sessionStorage.setItem('teamId', teamId);
                    ctx.partials = this.partials;
                    ctx.redirect('#/catalog');
                    auth.showInfo('Join team success.');
                })
                .catch(auth.handleError);
        });

        this.get('#/edit/:teamId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/home');
                return;
            }
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            let teamId = this.params.teamId;
            teamsService.loadTeamDetails(teamId)
                .then(function (team) {
                    ctx.teamId = team._id;
                    ctx.name = team.name;
                    ctx.comment = team.comment;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        editForm: './templates/edit/editForm.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/edit/editPage.hbs');
                    })
                })
                .catch(auth.handleError)
        });
        this.post('#/edit/:teamId', function (ctx) {
            let name = this.params.name;
            let comment = this.params.comment;
            let teamId = this.params.teamId;
            if (name === ''){
                auth.showError('Fill name.');
            } else {
                teamsService.edit(teamId, name, comment)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/catalog/' + teamId);
                        auth.showInfo('Team was edited.');
                    })
                    .catch(auth.handleError);
            }
        });
    });

    app.run();
});