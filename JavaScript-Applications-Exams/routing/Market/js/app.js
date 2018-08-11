let totalProducts = [];
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
        this.get('#/shop', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            productsService.getAllProducts()
                .then(function (allProducts) {
                    totalProducts = allProducts;
                    for (let currentProduct of allProducts) {
                        currentProduct.price = Number(currentProduct.price).toFixed(2);
                    }
                    ctx.products = allProducts;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articleProducts: './templates/shop/articleProducts.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/shop/mainShop.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/purchase/:id', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let userId = sessionStorage.getItem('userId');
            let purchaseId = this.params.id;
            let currentProduct = totalProducts.filter(a => a._id === purchaseId)[0];
            productsService.detailsUser(userId)
                .then(function (userInfo) {
                    let cart = {};
                    if (userInfo.cart !== undefined){
                        cart = userInfo.cart;
                    }
                    if (!cart.hasOwnProperty(currentProduct._id)){
                        cart[currentProduct._id] = {
                            quantity: 1,
                            product: {
                                name:currentProduct.name,
                                description: currentProduct.description,
                                price: currentProduct.price
                            }
                        };
                    } else {
                        cart[currentProduct._id]['quantity'] = Number(cart[currentProduct._id]['quantity']) + 1;
                    }
                    userInfo.cart = cart;
                    productsService.updateUser(userId, userInfo)
                        .then(function () {
                            ctx.partials = this.partials;
                            ctx.redirect('#/cart');
                            notify.showInfo('Product purchased.');
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });
        this.get('#/cart', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            productsService.detailsUser(sessionStorage.getItem('userId'))
                .then(function (userInfo) {
                    let cart = {};
                    if (userInfo.cart !== undefined){
                        cart = userInfo.cart;
                    }
                    let allProducts = [];
                    for (let currentProduct of Object.entries(cart)) {
                        let item = {};
                        item.name = currentProduct[1]['product']['name'];
                        item.description = currentProduct[1]['product']['description'];
                        item.quantity = Number(currentProduct[1]['quantity']);
                        item._id = currentProduct[0];
                        item.totalPrice = (Number(currentProduct[1]['quantity'])
                            * Number(currentProduct[1]['product']['price'])).toFixed(2);
                        allProducts.push(item);
                    }
                    ctx.products = allProducts;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesCart: './templates/cart/articlesCart.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/cart/mainCart.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/deleteProduct/:id', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let userId = sessionStorage.getItem('userId');
            let purchaseId = this.params.id;
            productsService.detailsUser(userId)
                .then(function (userInfo) {
                    let cart = {};
                    if (userInfo.cart !== undefined){
                        cart = userInfo.cart;
                    }
                    if (cart.hasOwnProperty(purchaseId)){
                        delete cart[purchaseId];
                    }
                    userInfo.cart = cart;
                    productsService.updateUser(userId, userInfo)
                        .then(function () {
                            ctx.partials = this.partials;
                            ctx.redirect('#/cart');
                            notify.showInfo('Product discarded.');
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });
    });
    app.run();
});