$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/index', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            this.loadPartials({
                footer : './templates/common/footer.hbs',
                loginForm : './templates/login/loginForm.hbs',
                registerForm : './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/indexPage.hbs');
            });
        });

        this.post('#/register', function (ctx) {
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            let username = this.params['username-register'];
            let password = this.params['password-register'];
            let repPassword = this.params['password-register-check'];
            if (username.length < 5){
                notify.showError('Too short username.');
            } else if (password.length === 0){
                notify.showError('Password could not be empty.');
            } else if (password !== repPassword){
                notify.showError('Password not match.');
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
            if (auth.isAuth()){
                this.redirect('#/home');
                return;
            }
            let username = this.params['username-login'];
            let password = this.params['password-login'];
            if (username.length < 5){
                notify.showError('Too short username.');
            } else if (password.length === 0){
                notify.showError('Password could not be empty.');
            }  else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        //$('#register-form').trigger('reset');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Login successful.');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/logout', function (ctx) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.partials = this.partials;
                    ctx.redirect('#/index');
                    notify.showInfo('Logout successful.');
                })
                .catch(notify.handleError);
        });

        this.get('#/home', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let userId = sessionStorage.getItem('userId');

            receipts.getActiveReceipt(userId)
                .then(function (currentReceipt) {
                    entries.getEntries(currentReceipt._id)
                        .then(function (allEntries) {
                            ctx.username = sessionStorage.getItem('username');
                            ctx.productCount = allEntries.length;
                            let total = 0;
                            for (let momentEntry of allEntries) {
                                let sum = Number(momentEntry['qty']) * Number(momentEntry['price']);
                                momentEntry['subTotal'] = sum.toFixed(2);
                                total += sum;
                            }
                            ctx.total = total.toFixed(2);
                            ctx.entries = allEntries;
                            ctx.receiptId = currentReceipt._id;
                            ctx.loadPartials({
                                header : './templates/common/header.hbs',
                                footer : './templates/common/footer.hbs',
                                entries : './templates/createReceipt/entries.hbs',
                                formReceipt : './templates/createReceipt/formReceipt.hbs',
                                checkOutForm : './templates/createReceipt/checkOut.hbs'
                            }).then(function () {
                                ctx.partials = this.partials;
                                ctx.partial('./templates/createReceipt/indexCreate.hbs');
                            });
                    });
                }).catch(notify.handleError);
        });
        this.post('#/addEntries/:idReceipt', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let name = this.params['type'];
            let qty = this.params['qty'];
            let price = this.params['price'];
            let idReceipt = this.params['idReceipt'];

            if (name.length === 0){
                notify.showError('Name product is empty.');
            } else if (isNaN(qty) || qty === null || qty.length === 0){
                notify.showError('Quantity could be number.');
            } else if (isNaN(price) || price === null || price.length === 0){
                notify.showError('Price could be number.');
            } else {
                entries.createEntries(name, qty, price, idReceipt)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Entry added');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/delete/:idEntry', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let idEntry = this.params.idEntry;
            entries.deleteEntries(idEntry)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                    notify.showInfo('Entry removed');
                })
                .catch(notify.handleError);
        });
        this.post('#/checkout/:idReceipt', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let idReceipt = this.params['idReceipt'];
            let productCount = this.params['productCount'];
            let total = this.params['total'];

            if (productCount === '0'){
                notify.showError('The receipt hasn\'t products.');
            } else {
                receipts.commitReceipt(idReceipt, {active: false, productCount, total})
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Receipt checked out');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/allReceipts', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let userId = sessionStorage.getItem('userId');

            receipts.getMyReceipts(userId)
                .then(function (myReceipt) {
                    let total = 0;
                    for (let element of myReceipt) {
                        let allSecs = Date.parse(element._kmd.lmt);
                        let currentData = new Date(allSecs);
                        element.data = `${currentData.getFullYear()}-${('0' + (currentData.getMonth() + 1)).slice(-2)}`+
                            `-${('0' + currentData.getDate()).slice(-2)} ${('0' + currentData.getHours()).slice(-2)}:${('0' + currentData.getMinutes()).slice(-2)}`;
                        total += Number(element.total);
                    }
                    ctx.total = total;
                    ctx.allReceipts = myReceipt;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header : './templates/common/header.hbs',
                        footer : './templates/common/footer.hbs',
                        tableReceipts : './templates/myReceipts/tableReceipts.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myReceipts/indexMyReceipts.hbs');
                    });
                }).catch(notify.handleError);
        });
        this.get('#/details/:receiptId', function (ctx) {
            if (!auth.isAuth()){
                this.redirect('#/index');
                return;
            }
            let receiptId = this.params.receiptId;

            entries.getEntries(receiptId)
                .then(function (entries) {
                    for (let currentEntry of entries) {
                        currentEntry.totalPrice = (Number(currentEntry.qty) * Number(currentEntry.price)).toFixed(2);
                    }
                    ctx.entries = entries;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header : './templates/common/header.hbs',
                        footer : './templates/common/footer.hbs',
                        tableDetails : './templates/details/detailsTable.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/details/indexDetails.hbs');
                    });
                }).catch(notify.handleError);
        });
    });
    app.run();
});