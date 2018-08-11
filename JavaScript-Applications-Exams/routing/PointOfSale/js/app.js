$(() => {
    const app = new Sammy("#container", function () {
        this.use('Handlebars', 'hbs');
		
		this.get('index.html', welcomePage);
		this.get('#/index', welcomePage);
        this.post('#/register', function (ctx) {
            let username = this.params['username-register'];
            let password = this.params['password-register'];
            let repeatPass = this.params['password-register-check'];

            if (username.length < 5) {
                notify.showError('Too short password!');
            } else if (password === '') {
                notify.showError('Password is empty!');
            } else if (password  !== repeatPass) {
                notify.showError('Passwords does not match!');
            } else {
                auth.register(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        notify.showInfo('User registration successful.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });
        this.post('#/login', function (ctx) {
            let username = this.params['username-login'];
            let password = this.params['password-login'];

            if (username.length < 5) {
                notify.showError('Too short password!');
            } else if (password === '') {
                notify.showError('Password is empty!');
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
            let userId = sessionStorage.getItem('userId');
            this.username = sessionStorage.getItem('username');
            receiptsService.getActiveReceipt(userId)
                .then(function (receipt) {
                    entryService.getEntriesByReceipt(receipt._id)
                        .then(function (entries) {
                            let totalSum = 0;
                            for (let entry of entries) {
                                let sum = Number(entry.price) * Number(entry.qty);
                                entry.price = Number(entry.price).toFixed(2);
                                entry.totalPrice = sum.toFixed(2);
                                totalSum += sum;
                            }
                            ctx.entries = entries;
                            ctx.receiptId = receipt._id;
                            ctx.totalSum = totalSum.toFixed(2);
                            ctx.productCount = entries.length;
                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                articleEntries: './templates/home/articleEntries.hbs',
                                createEntry: './templates/home/createEntry.hbs',
                                checkoutForm: './templates/home/checkoutForm.hbs'
                            }).then(function () {
                                ctx.partials = this.partials;
                                ctx.partial('./templates/home/mainHome.hbs');
                            });
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });
        this.post('#/createEntry/:receiptId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            let type = this.params.type;
            let qty = this.params.qty;
            let price = this.params.price;
            let receiptId = this.params.receiptId;

            if (type === '') {
                notify.showError('Empty type!');
            } else if (isNaN(Number(qty)) || qty.length === 0) {
                notify.showError('Quantity must be a number!');
            } else if (isNaN(Number(price)) || price.length === 0) {
                notify.showError('Price must be a number!');
            } else {
                entryService.createEntry(type, qty, price, receiptId)
                    .then(function () {
                        notify.showInfo('Entry added');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/deleteEntry/:entryId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            let entryId = this.params.entryId;

            entryService.deleteEntry(entryId)
                .then(function () {
                    notify.showInfo('Entry removed');
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                })
                .catch(notify.handleError);
        });
        this.post('#/checkout/:receiptId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            let receiptId = this.params.receiptId;
            let productCount = this.params.productCount;
            let total = this.params.total;

            if (productCount === '0') {
                notify.showError('Empty receipt!');
            } else {
                receiptsService.commitReceipt(receiptId, productCount, total)
                    .then(function () {
                        notify.showInfo('Receipt checked out');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/allReceipts', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            let userId = sessionStorage.getItem('userId');
            this.username = sessionStorage.getItem('username');
            receiptsService.getMyReceipt(userId)
                .then(function (receipts) {
                    let totalSum = 0;
                    for (let receipt of receipts) {
                        let date = new Date(receipt._kmd.ect);
                        let year = date.getFullYear();
                        let month = ('0' + date.getMonth()).slice(-2);
                        let day = ('0' + date.getDate()).slice(-2);
                        let hours = ('0' + date.getHours()).slice(-2);
                        let minutes = ('0' + date.getMinutes()).slice(-2);
                        receipt.date = `${year}-${month}-${day} ${hours}:${minutes}`;
                        totalSum += Number(receipt.total);
                    }
                    ctx.receipts = receipts;
                    ctx.totalSum = totalSum.toFixed(2);
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesReceipts: './templates/allReceipts/articlesReceipts.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/allReceipts/mainAllReceipts.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.get('#/detailReceipts/:receiptId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.username = sessionStorage.getItem('username');
            let receiptId = this.params.receiptId;
            entryService.getEntriesByReceipt(receiptId)
                .then(function (entries) {
                    for (let entry of entries) {
                        let sum = Number(entry.price) * Number(entry.qty);
                        entry.price = Number(entry.price).toFixed(2);
                        entry.totalPrice = sum.toFixed(2);
                    }
                    ctx.entries = entries;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesReceiptDetails: './templates/detailsReceipt/articlesReceiptDetails.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/detailsReceipt/mainDetailsReceipt.hbs');
                    });
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
                footer: './templates/common/footer.hbs',
                loginForm: './templates/loginForm.hbs',
                registerForm: './templates/registerForm.hbs',
            }).then(function () {
                this.partial('./templates/index.hbs');
            });
        }
    });
    app.run();
});