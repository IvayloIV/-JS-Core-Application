$(() => {
    const app = new Sammy("#main", function () {
        this.use('Handlebars', 'hbs');

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
            let password = this.params.pass;
            let checkPass = this.params.checkPass;

            if (username.length < 5){
                notify.showError('Too short username.');
            } else if (password === ''){
                notify.showError('Password is empty.');
            } else if (password !== checkPass) {
                notify.showError('Passwords are different.');
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
            let password = this.params.pass;

            if (username.length < 5){
                notify.showError('Too short username.');
            } else if (password === ''){
                notify.showError('Password is empty.');
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
                    ctx.redirect('#/login');
                    notify.showInfo('Logout successful.');
                })
                .catch(notify.handleError)
        });

        this.get('#/home', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            flightsService.getPublishedFlights()
                .then(function (flights) {
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    for (let flight of flights) {
                        let currentDate = new Date(flight.departureDate);
                        flight.departureDate = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
                    }
                    ctx.flights = flights;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articleFlights: './templates/home/articleFlights.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/mainHome.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/createFlight', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                formCreateFlight: './templates/createFlight/formCreateFlight.hbs'
            }).then(function () {
                this.partial('./templates/createFlight/mainCreateFlight.hbs');
            });
        });
        this.post('#/createFlight', function (ctx) {
            let destination = this.params.destination;
            let origin = this.params.origin;
            let departureDate = this.params.departureDate;
            let departureTime = this.params.departureTime;
            let seats = Number(this.params.seats);
            let cost = Number(this.params.cost);
            let img = this.params.img;
            let isPublic = this.params.public;
            isPublic = isPublic === 'on';

            if (destination === ''){
                notify.showError('Destination id empty.');
            } else if (origin === ''){
                notify.showError('Origin is empty.');
            } else if (isNaN(cost) || cost === null) {
                notify.showError('Cost is not a number.');
            } else if (isNaN(seats) || seats === null) {
                notify.showError('Seats is not a number.');
            } else if (seats <= 0) {
                notify.showError('Seats can`t be negative number.');
            } else if (cost <= 0) {
                notify.showError('Cost can`t be negative number.');
            } else {
                flightsService.createFlight(destination, origin, departureDate, departureTime, seats, cost, img, isPublic)
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                        notify.showInfo('Created flight.');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/details/:idFlight', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let idFlight = this.params.idFlight;
            flightsService.detailsFlight(idFlight)
                .then(function (flight) {
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    let currentDate = new Date(flight.departureDate);
                    flight.departureDate = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
                    flight.isOwner = sessionStorage.getItem('userId') === flight._acl.creator;
                    ctx.flight = flight;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/flightsDetails/mainFlightDetails.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/editFlight/:idFlight', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let flightId = this.params.idFlight;
            flightsService.detailsFlight(flightId)
                .then(function (flight) {
                    flight.isChecked = flight.isPublished === "true";
                    ctx.flight = flight;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        formEditFlight: './templates/editFlight/formEditFlight.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editFlight/mainEditFlight.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.post('#/editFlight/:idFlight', function (ctx) {
            let destination = this.params.destination;
            let origin = this.params.origin;
            let departureDate = this.params.departureDate;
            let departureTime = this.params.departureTime;
            let seats = Number(this.params.seats);
            let cost = Number(this.params.cost);
            let image = this.params.img;
            let isPublic = this.params.public;
            let isPublished = isPublic === 'on';
            let flightId = this.params.idFlight;

            if (destination === ''){
                notify.showError('Destination id empty.');
            } else if (origin === ''){
                notify.showError('Origin is empty.');
            } else if (isNaN(cost) || cost === null) {
                notify.showError('Cost is not a number.');
            } else if (isNaN(seats) || seats === null) {
                notify.showError('Seats is not a number.');
            } else if (seats <= 0) {
                notify.showError('Seats can`t be negative number.');
            } else if (cost <= 0) {
                notify.showError('Cost can`t be negative number.');
            } else {
                flightsService.editFlight(flightId, {destination,
                    origin,
                    departureDate,
                    departureTime,
                    seats: Number(seats),
                    cost: Number(cost),
                    image,
                    isPublished})
                    .then(function () {
                        ctx.partials = this.partials;
                        ctx.redirect('#/details/' + flightId);
                        notify.showInfo('Successfully edited flight.');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/myFlights', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            flightsService.myFlight(sessionStorage.getItem('userId'))
                .then(function (flights) {
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    for (let flight of flights) {
                        let currentDate = new Date(flight.departureDate);
                        flight.departureDate = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
                    }
                    ctx.flights = flights;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesFlights: './templates/myFlights/articlesFlights.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myFlights/mainMyFlights.hbs');
                    });
                })
                .catch(notify.handleError);
        });
        this.get('#/deleteFlight/:idFlight', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let idFlight = this.params.idFlight;
            flightsService.deleteFlight(idFlight)
                .then(function () {
                    ctx.partials = this.partials;
                    ctx.redirect('#/myFlights');
                    notify.showInfo('Flight deleted.');
                })
                .catch(notify.handleError);
        });
    });
    app.run();
});