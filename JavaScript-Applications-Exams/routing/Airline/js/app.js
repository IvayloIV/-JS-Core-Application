$(() => {
    const app = new Sammy("#container", function () {
        this.use('Handlebars', 'hbs');
		
		this.get('index.html', welcomePage);
		this.get('#/login', welcomePage);
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.pass;

            if (username.length < 5) {
                notify.showError('Too short username!');
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

            if (username.length < 5) {
                notify.showError('Too short username!');
            } else if (password === '') {
                notify.showError('Password is empty!');
            } else if (password !== checkPass) {
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
                    ctx.redirect('#/login');
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
            flightsService.getFlights()
                .then(function (planes) {
                    for (let plane of planes) {
                        let monthNames = [ "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December" ];
                        let currentDate = new Date(plane.departureDate);
                        plane.date = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
                    }
                    ctx.planes = planes;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articlesPlane: './templates/home/articlesPlane.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/mainHome.hbs');
                    })
                })
                .catch(notify.handleError);
        });

        this.get('#/createPlane', function (ctx) {
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
                createPlaneForm: './templates/createPlane/createPlaneForm.hbs'
            }).then(function () {
                this.partial('./templates/createPlane/mainCreatePlane.hbs');
            })
        });
        this.post('#/createPlane', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let destination = this.params.destination;
            let origin = this.params.origin;
            let departureDate = this.params.departureDate;
            let departureTime = this.params.departureTime;
            let seats = this.params.seats;
            let cost = this.params.cost;
            let image = this.params.img;
            let isPublished = this.params.public;

            isPublished = isPublished === 'on';

            if (destination === "") {
                notify.showError('Destination is empty!');
            } else if (origin === "") {
                notify.showError('Origin is empty!');
            } else if (isNaN(Number(seats)) || seats.length === 0) {
                notify.showError('Seats must be a number!');
            } else if (isNaN(Number(cost)) || cost.length === 0) {
                notify.showError('Cost must be a number!');
            } else if (Number(seats) < 0) {
                notify.showError('Seats must be a positive number!');
            } else if (Number(cost) < 0) {
                notify.showError('Cost must be a positive number!');
            } else {
                flightsService.createFlight(destination, origin, departureDate,
                    departureTime, seats, cost, image, isPublished)
                    .then(function () {
                        notify.showInfo('Created flight.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/detailsPlane/:planeId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let planeId = this.params.planeId;
            flightsService.flightDetails(planeId)
                .then(function (plane) {
                    let monthNames = [ "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December" ];
                    let currentDate = new Date(plane.departureDate);
                    plane.date = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
                    plane.isOwner = sessionStorage.getItem('userId') === plane._acl.creator;
                    ctx.flight = plane;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/flightDetails/mainFlightDetails.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/editPlane/:planeId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let planeId = this.params.planeId;
            flightsService.flightDetails(planeId)
                .then(function (flight) {
                    ctx.isPublish = flight.isPublished === 'true';
                    ctx.flight = flight;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        formEditPlane: './templates/editPlane/formEditPlane.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editPlane/mainEditPlane.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.post('#/editPlane/:planeId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let destination = this.params.destination;
            let origin = this.params.origin;
            let departureDate = this.params.departureDate;
            let departureTime = this.params.departureTime;
            let seats = this.params.seats;
            let cost = this.params.cost;
            let image = this.params.img;
            let isPublished = this.params.public;

            isPublished = isPublished === 'on';
            let flightId = this.params.planeId;
            if (destination === "") {
                notify.showError('Destination is empty!');
            } else if (origin === "") {
                notify.showError('Origin is empty!');
            } else if (isNaN(Number(seats)) || seats.length === 0) {
                notify.showError('Seats must be a number!');
            } else if (isNaN(Number(cost)) || cost.length === 0) {
                notify.showError('Cost must be a number!');
            } else if (Number(seats) < 0) {
                notify.showError('Seats must be a positive number!');
            } else if (Number(cost) < 0) {
                notify.showError('Cost must be a positive number!');
            } else {
                flightsService.editFlight(flightId, destination, origin, departureDate,
                    departureTime, seats, cost, image, isPublished)
                    .then(function () {
                        notify.showInfo('Successfully edited flight.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/detailsPlane/' + flightId);
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
            let userId = sessionStorage.getItem('userId');
            flightsService.myFlights(userId)
                .then(function (flights) {
                    for (let flight of flights) {
                        let monthNames = [ "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December" ];
                        let currentDate = new Date(flight.departureDate);
                        flight.date = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
                    }
                    ctx.flights = flights;
                    ctx.loadPartials({
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        articleFlights: './templates/myFlights/articleFlights.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myFlights/mainMyFlights.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/removePlane/:planeId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/login');
                return;
            }
            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            let planeId = this.params.planeId;
            flightsService.deleteFlight(planeId)
                .then(function () {
                    notify.showInfo('Flight deleted.');
                    ctx.partials = this.partials;
                    ctx.redirect('#/myFlights');
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
                nav: './templates/common/nav.hbs',
                footer: './templates/common/footer.hbs',
                formLogin: './templates/login/formLogin.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            })
        }
    });
    app.run();
});