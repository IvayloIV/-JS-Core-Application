let totalProd = [];
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
                this.partial('./templates/indexPage.hbs');
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
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/indexRegister.hbs');
            });
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let name = this.params.name;
            auth.register(username, password, name)
                .then(function (userData) {
                    auth.saveSession(userData);
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
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/indexLogin.hbs');
            });
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            auth.login(username, password)
                .then(function (userData) {
                    auth.saveSession(userData);
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
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            this.isAuth = true;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/homePage/indexHome.hbs');
            });
        });

        this.get('#/shop', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            this.isAuth = true;
            this.username = sessionStorage.getItem('username');
            products.getAllProducts()
                .then(function (products) {
                    totalProd = products;
                    for (let product of products) {
                        product.price = product.price.toFixed(2);
                    }
                    ctx.products = products;
                    ctx.loadPartials({
                        navigation: './templates/common/navigation.hbs',
                        footer: './templates/common/footer.hbs',
                        products: './templates/shop/products.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/shop/indexShop.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.get('#/purchase/:productId', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let productId = this.params.productId;
            let userId = sessionStorage.getItem('userId');
            products.getCurrentUser(userId)
                .then(function (userInfo) {
                    if (userInfo['cart'] === undefined){
                        userInfo['cart'] = {};
                    }
                    if (userInfo['cart'].hasOwnProperty(productId)){
                        userInfo['cart'][productId]['quantity'] = (Number(userInfo['cart'][productId]['quantity']) + 1).toString();
                    } else {
                        let productInfoM = totalProd.filter(a => a._id === productId)[0];
                        userInfo['cart'][productId] = {
                            "quantity": "1",
                            "product": {
                                "name": productInfoM['name'],
                                "description": productInfoM['description'],
                                "price": productInfoM['price']
                            }
                        };
                    }
                    products.updateUser(userId, userInfo)
                        .then(function () {
                            ctx.partials = this.partials;
                            ctx.redirect('#/card');
                            notify.showInfo('Product purchased.');
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });

        this.get('#/card', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            this.isAuth = true;
            this.username = sessionStorage.getItem('username');
            let userId = sessionStorage.getItem('userId');
            products.getCurrentUser(userId)
                .then(function (userInfo) {
                    let items = userInfo.cart;
                    let allItems = [];
                    if(items !== undefined) {
                        for (let currentItem of Object.entries(items)) {
                            allItems.push({
                                id: currentItem[0],
                                name: currentItem[1]['product']['name'],
                                description: currentItem[1]['product']['description'],
                                quantity: currentItem[1]['quantity'],
                                totalPrice: (Number(currentItem[1]['product']['price'])
                                    * Number(currentItem[1]['quantity'])).toFixed(2)
                            });
                        }
                    }
                    ctx.cardInfo = allItems;
                    ctx.loadPartials({
                        navigation: './templates/common/navigation.hbs',
                        footer: './templates/common/footer.hbs',
                        card: './templates/card/infoCard.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/card/indexCard.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.get('#/delete/:productId', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let productId = this.params.productId;
            let userId = sessionStorage.getItem('userId');
            products.getCurrentUser(userId)
                .then(function (userInfo) {
                    delete userInfo['cart'][productId];
                    products.updateUser(userId, userInfo)
                        .then(function () {
                            ctx.partials = this.partials;
                            ctx.redirect('#/card');
                            notify.showInfo('Product discarded.');
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });
    });

    app.run();
});