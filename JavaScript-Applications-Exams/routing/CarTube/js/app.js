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


            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Username must be with alphabet letters and at least 3 characters long!');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                notify.showError('Password must be with alphabet letters or numbers and at least 6 characters long!');
            } else if (password !== repeatPass) {
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
                notify.showError('Username must be with alphabet letters and at least 3 characters long!');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                notify.showError('Password must be with alphabet letters or numbers and at least 6 characters long!');
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
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            carsService.listAllCars()
                .then(function (cars) {
                    for (let car of cars) {
                        car.isOwner = car._acl.creator === sessionStorage.getItem('userId')
                    }
                    ctx.cars = cars;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articleCars: './templates/home/articleCars.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/mainHome.hbs');
                    })
                })
                .catch(notify.handleError);
        });

        this.get('#/createCar', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                formCreateCar: './templates/createCar/formCreateCar.hbs'
            }).then(function () {
                this.partial('./templates/createCar/mainCreateCar.hbs');
            })
        });
        this.post('#/createCar', function (ctx) {
            let title = this.params.title;
            let description = this.params.description;
            let brand = this.params.brand;
            let model = this.params.model;
            let year = this.params.year;
            let imageUrl = this.params.imageUrl;
            let fuelType = this.params.fuelType;
            let price = this.params.price;
            let seller = sessionStorage.getItem('username');


            if (title === '' || description === '' || brand === '' ||
                model === '' || year === '' || imageUrl === '' ||
                fuelType === '' || price === '') {
                notify.showError('Fill all inputs!');
            } else if (title.length > 33) {
                notify.showError('Max title length is 33 letters!');
            } else if (description.length  < 30 || description.length > 450) {
                notify.showError('The description must be between 30 and 450 letters!');
            } else if (brand.length > 11) {
                notify.showError('Brand exceed 11 characters!');
            } else if (fuelType.length > 11) {
                notify.showError('FuelType exceed 11 characters!');
            }  else if (model.length > 11) {
                notify.showError('Model exceed 11 characters!');
            } else if (model.length < 4) {
                notify.showError('Min length of model is at least 4 letters!');
            } else if (year.length !== 4) {
                notify.showError('Invalid year!');
            } else if (Number(price) > 1000000) {
                notify.showError('The maximum price is 1000000$!');
            } else if (!imageUrl.startsWith('http')) {
                notify.showError('Link url should always start with "http"!');
            }else {
                carsService.createCar(brand, description, fuelType, imageUrl, model,
                    price, seller, title, year)
                    .then(function () {
                        notify.showInfo('listing created.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/editCar/:carId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let carId = this.params.carId;
            carsService.getCurrentCar(carId)
                .then(function (car) {
                    ctx.car = car;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        formEditCar: './templates/editCar/formEditCar.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editCar/mainEditCar.hbs');
                    })
                }).catch(notify.handleError);
        });
        this.post('#/editCar/:carId', function (ctx) {
            let title = this.params.title;
            let description = this.params.description;
            let brand = this.params.brand;
            let model = this.params.model;
            let year = this.params.year;
            let imageUrl = this.params.imageUrl;
            let fuelType = this.params.fuelType;
            let price = this.params.price;
            let seller = sessionStorage.getItem('username');
            let cardId = this.params.carId;


            if (title === '' || description === '' || brand === '' ||
                model === '' || year === '' || imageUrl === '' ||
                fuelType === '' || price === '') {
                notify.showError('Fill all inputs!');
            } else if (title.length > 33) {
                notify.showError('Max title length is 33 letters!');
            } else if (description.length  < 30 || description.length > 450) {
                notify.showError('The description must be between 30 and 450 letters!');
            } else if (brand.length > 11) {
                notify.showError('Brand exceed 11 characters!');
            } else if (fuelType.length > 11) {
                notify.showError('FuelType exceed 11 characters!');
            }  else if (model.length > 11) {
                notify.showError('Model exceed 11 characters!');
            } else if (model.length < 4) {
                notify.showError('Min length of model is at least 4 letters!');
            } else if (year.length !== 4) {
                notify.showError('Invalid year!');
            } else if (Number(price) > 1000000) {
                notify.showError('The maximum price is 1000000$!');
            } else if (!imageUrl.startsWith('http')) {
                notify.showError('Link url should always start with "http"!');
            }else {
                carsService.editCar(cardId, brand, description, fuelType, imageUrl, model,
                    price, seller, title, year)
                    .then(function () {
                        notify.showInfo(`Listing ${title} updated.`);
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/deleteCar/:carId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let carId = this.params.carId;
            carsService.deleteCar(carId)
                .then(function () {
                    notify.showInfo('Listing deleted.');
                    ctx.partials = this.partials;
                    ctx.redirect('#/home');
                }).catch(notify.handleError);
        });

        this.get('#/detailsCar/:carId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let carId = this.params.carId;
            carsService.getCurrentCar(carId)
                .then(function (currentCar) {
                    currentCar.isOwner = sessionStorage.getItem('userId') === currentCar._acl.creator;
                    ctx.car = currentCar;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/carDetails/mainCarDetails.hbs');
                    })
                })
        });

        this.get('#/myCars', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }
            this.isAuth = isAuth;
            let username = sessionStorage.getItem('username');
            this.username = username;
            carsService.myCars(username)
                .then(function (cars) {
                    for (let car of cars) {
                        car.isOwner = car._acl.creator === sessionStorage.getItem('userId');
                    }
                    ctx.cars = cars;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articleCars: './templates/myCars/articleCars.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myCars/mainMyCars.hbs');
                    })
                })
                .catch(notify.handleError)
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