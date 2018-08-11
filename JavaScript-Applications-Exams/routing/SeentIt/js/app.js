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
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                formLogin: './templates/formLogin.hbs',
                formRegister: './templates/formRegister.hbs'
            }).then(function () {
                this.partial('./templates/index.hbs');
            });
        }
		
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let repeatPass = this.params.repeatPass;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Invalid username!');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                notify.showError('Invalid password!');
            } else if (password !== repeatPass) {
                notify.showError('Passwords does not match!');
            } else {
                auth.register(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('User registration successful.');
                    })
                    .catch(notify.handleError);
            }
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Invalid username!');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                notify.showError('Invalid password!');
            } else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Login successful.');
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
            postsService.getAllPosts()
                .then(function (allPosts) {
                    let rank = 1;
                    for (let currentPost of allPosts) {
                        currentPost.rank = rank++;
                        currentPost.data = postsService.calcTime(currentPost._kmd.ect);
                        currentPost.isOwner = currentPost._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.posts = allPosts;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        articlesCatalog: './templates/home/articlesCatalog.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/catalog.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/createPost', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                nav: './templates/common/nav.hbs',
                formCreatePost: './templates/createPost/formCreatePost.hbs',
            }).then(function () {
                this.partial('./templates/createPost/mainCreatePost.hbs');
            });
        });
        this.post('#/createPost', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let url = this.params.url;
            let title = this.params.title;
            let imageUrl = this.params.image;
            let description = this.params.comment;
            let author = sessionStorage.getItem('username');

            if (url === '') {
                notify.showError('Empty url!');
            } else if (title === '') {
                notify.showError('Empty title!');
            } else if (!url.startsWith('http')) {
                notify.showError('Url should start with http!');
            } else {
                postsService.createPost(author, title, description, url, imageUrl)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Post created.');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/editPost/:postId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let idPost = this.params.postId;
            postsService.postDetails(idPost)
                .then(function (post) {
                    ctx.post = post;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        formEditPost: './templates/editPost/formEditPost.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editPost/mainEditPost.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.post('#/editPost/:postId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let url = this.params.url;
            let title = this.params.title;
            let imageUrl = this.params.image;
            let description = this.params.description;
            let author = sessionStorage.getItem('username');
            let postId = this.params.postId;

            if (url === '') {
                notify.showError('Empty url!');
            } else if (title === '') {
                notify.showError('Empty title!');
            } else if (!url.startsWith('http')) {
                notify.showError('Url should start with http!');
            } else {
                postsService.editPost(postId, author, title, description, url, imageUrl)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo(`Post ${title} updated.`);
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/deletePost/:postId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let idPost = this.params.postId;
            postsService.deletePost(idPost)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                    notify.showInfo('Post deleted.');
                })
                .catch(notify.handleError);
        });

        this.get('#/myPosts', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            let username = sessionStorage.getItem('username');
            this.username = username;
            postsService.myPosts(username)
                .then(function (allPosts) {
                    let rank = 1;
                    for (let currentPost of allPosts) {
                        currentPost.rank = rank++;
                        currentPost.data = postsService.calcTime(currentPost._kmd.ect);
                        currentPost.isOwner = currentPost._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.posts = allPosts;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        articlesCatalog: './templates/home/articlesCatalog.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myPosts/mainMyPosts.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/comments/:postId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let idPost = this.params.postId;
            Promise.all([postsService.postDetails(idPost), commentsService.getCommentsByPostId(idPost)])
                .then(function ([post, comments]) {
                    if (post['description'] === '') {
                        post['description'] = undefined;
                    }
                    post.data = postsService.calcTime(post._kmd.ect);
                    post.isOwner = post._acl.creator === sessionStorage.getItem('userId');
                    ctx.post = post;
                    for (let comment of comments) {
                        comment.data = postsService.calcTime(comment._kmd.ect);
                        comment.isOwner = comment._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.comments = comments;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        postInfo: './templates/comments/postInfo.hbs',
                        formCreatePost: './templates/comments/formCreatePost.hbs',
                        articlesComments: './templates/comments/articlesComments.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/comments/mainComments.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.post('#/createComment/:postId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let content = this.params.content;
            let postId = this.params.postId;

            if (content === '') {
                notify.showError('Empty content input!');
            } else {
                commentsService.createComment(postId, content)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect(`#/comments/${postId}`);
                        notify.showInfo('Comment created.');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/deleteComment/:commentId/:postId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let idPost = this.params.postId;
            let idComment = this.params.commentId;
            commentsService.deleteComment(idComment)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect(`#/comments/${idPost}`);
                    notify.showInfo('Comment deleted.');
                })
                .catch(notify.handleError);
        });
    });
    app.run();
});