$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/index', function () {
            this.loggedIn = sessionStorage.getItem('authtoken');
            this.username = sessionStorage.getItem('username');
            if (sessionStorage.getItem('teamId')) {
                this.hasTeam = true;
                this.teamId = sessionStorage.getItem('teamId');
            }
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/home/home.hbs');
            });
        });

        this.get('#/login', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs',
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        });

        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            auth.login(username, password)
                .then(function (user) {
                    auth.saveSession(user);
                    ctx.redirect('#/index');
                    auth.showInfo('Login success.');
                })
                .catch(function () {
                    auth.showError('Invalid data.');
                });
        });

        this.get('#/register', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs',
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });

        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let repeatPassword = this.params.repeatPassword;

            if (password !== repeatPassword){
                auth.showError('Different passwords.');
                return;
            }
            auth.register(username, password, repeatPassword)
                .then(function (user) {
                    auth.saveSession(user);
                    ctx.redirect('#/index');
                    auth.showInfo('Register success.');
                })
                .catch(function () {
                    auth.showError('Invalid data.');
                });
        });

        this.get('#/logout', function (ctx) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.redirect('#/index');
                    auth.showInfo('Logout success.');
                })
                .catch(function () {
                    auth.showError('Invalid data.');
                });
        });

        this.get('#/about', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/about/about.hbs');
            });
        });

        this.get('#/catalog', function (ctx) {

            teamsService.loadTeams().then(function (teams) {
                if (!sessionStorage.getItem('teamId')){
                    ctx.hasNoTeam = true;
                }
                ctx.teams = teams;
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    team: './templates/catalog/team.hbs',
                }).then(function () {
                    ctx.partials = this.partials;
                    ctx.partial('./templates/catalog/teamCatalog.hbs');
                });
            });
        });

        this.get('#/catalog/:productId', function (ctx) {
            teamsService.loadTeamDetails(ctx.params.productId.slice(1)).then(function (user) {
                ctx.name = user.name;
                ctx.members = user.members;
                ctx.comment = user.comment;
                ctx.teamId = user._id;
                if (user._acl.creator === sessionStorage.getItem('userId')){
                    ctx.isAuthor = true;
                }
                ctx.isOnTeam = user._id === sessionStorage.getItem('teamId');

                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    teamMember: './templates/catalog/teamMember.hbs',
                    teamControls: './templates/catalog/teamControls.hbs'
                }).then(function () {
                    ctx.partials = this.partials;
                    ctx.partial('./templates/catalog/details.hbs');
                });
            });
        });

        this.get('#/edit/:productId', function (ctx) {
            teamsService.loadTeamDetails(ctx.params.productId.slice(1)).then(function (user) {
                ctx.teamId = user._id;
                ctx.name = user.name;
                ctx.comment = user.comment;
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    editForm: './templates/edit/editForm.hbs',
                    }).then(function () {
                    ctx.partials = this.partials;
                    ctx.partial('./templates/edit/editPage.hbs');
                });
            });
        });

        this.post('#/edit/:productId', function (ctx) {
            let id = sessionStorage.getItem('teamId');
            let name = ctx.params.name;
            let comment = ctx.params.comment;
            teamsService.edit(id, name, comment).then(function (result) {
                ctx.partials = this.partial;
                ctx.redirect('#/catalog');
                auth.showInfo('Edited success.');
            });
        });

        this.get('#/join/:productId', function (ctx) {
            let teamId = ctx.params.productId.slice(1);
            teamsService.joinTeam(teamId)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    ctx.partials = this.partial;
                    ctx.redirect(`#/catalog`);
                    auth.showInfo('Joined success.');
                });
        });

        this.get('#/leave', function (ctx) {
            teamsService.leaveTeam()
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    ctx.partials = this.partial;
                    ctx.redirect(`#/catalog`);
                    auth.showInfo('Leave success.');
                });
        });

        this.get('#/create', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs',
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            });
        });

        this.post('#/create', function (ctx) {
            let name = this.params.name;
            let comment = this.params.comment;
            teamsService.createTeam(name, comment)
                .then(function (team) {
                    sessionStorage.setItem('teamId', team._id);
                    ctx.partials = this.partials;
                    ctx.redirect('#/catalog');
                    auth.showInfo('Created success.');
                }).catch(function () {
                auth.showError('Invalid data.');
            });
        });
    });

    app.run();
});