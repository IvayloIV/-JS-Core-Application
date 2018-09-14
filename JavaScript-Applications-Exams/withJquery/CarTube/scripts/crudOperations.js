function loginUser() {
    let username = $('#login input[name="username"]').val();
    let password = $('#login input[name="password"]').val();

    if (!/[A-Za-z]{3,}/.test(username)) {
        showError('A username should be at least 3 characters long and should contain only english alphabet letters.');
    } else if (!/[A-Za-z0-9]{6,}/.test(password)) {
        showError('A user‘s password should be at least 6 characters long and should contain only english alphabet letters and digits.');
    } else {
        remote.post('user', 'login', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'Login successful.');
            }).catch(handleAjaxError);
    }
}
function registerUser() {
    let username = $('#register input[name="username"]').val();
    let password = $('#register input[name="password"]').val();
    let repeatPass = $('#register input[name="repeatPass"]').val();

    if (!/[A-Za-z]{3,}/.test(username)) {
        showError('A username should be at least 3 characters long and should contain only english alphabet letters.');
    } else if (!/[A-Za-z0-9]{6,}/.test(password)) {
        showError('A user‘s password should be at least 6 characters long and should contain only english alphabet letters and digits.');
    } else if (repeatPass !== password) {
        showError('Both passwords must match!');
    } else {
        remote.post('user', '', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'User registration successful.');
            }).catch(handleAjaxError);
    }
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
}
function logoutUser() {
	remote.post('user', '_logout', 'kinvey')
    .then(function () {
        sessionStorage.clear();
        showUnLoggedHome();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(function (err) {
        handleAjaxError(err);
    });
}

async function showCars() {
    try {
        let cars = await remote.get('appdata', `cars?query={}&sort={"_kmd.ect": -1}`, 'kinvey');
        let articles = $('#listings');
        articles.empty();
        if (cars.length === 0) {
            articles.append($('<p>').addClass('no-cars').text(`No cars in database.`));
        } else {
            for (let car of cars) {
                let htmlCar = $('<div>').addClass('listing')
                    .append($('<p>').text(car.title))
                    .append($('<img>').attr('src', car.imageUrl))
                    .append($('<h2>').text(`Brand: ${car.brand}`))
                    .append($('<div>').addClass('info')
                        .append($('<div>').attr('id', 'data-info')
                            .append($('<h3>').text(`Seller: ${car.seller}`))
                            .append($('<h3>').text(`Fuel: ${car.fuel}`))
                            .append($('<h3>').text(`Year: ${car.year}`))
                            .append($('<h3>').text(`Price: ${car.price} $`)))
                        .append($('<div>').attr('id', 'data-buttons')
                            .append($('<ul>')
                                .append($('<li>').addClass('action')
                                    .append($('<a>').attr('href', '#').addClass('button-carDetails').text('Details').on('click', detailsCar.bind(this, car)))))));
                if (car._acl.creator === sessionStorage.getItem('userId')) {
                    htmlCar.find('#data-buttons ul')
                        .append($('<li>').addClass('action')
                            .append($('<a>').attr('href', '#').addClass('button-carDetails').text('edit').on('click', showEditCar.bind(this, car))))
                        .append($('<li>').addClass('action')
                            .append($('<a>').attr('href', '#').addClass('button-carDetails').text('delete').on('click', deleteCar.bind(this, car._id))));
                }
                articles.append(htmlCar);
            }
        }
        showView('car-listings');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function createCar() {
    try {
        let title = $('#create-listing input[name="title"]').val();
        let description = $('#create-listing input[name="description"]').val();
        let brand = $('#create-listing input[name="brand"]').val();
        let model = $('#create-listing input[name="model"]').val();
        let year = $('#create-listing input[name="year"]').val();
        let imageUrl = $('#create-listing input[name="imageUrl"]').val();
        let fuel = $('#create-listing input[name="fuelType"]').val();
        let price = $('#create-listing input[name="price"]').val();

        if (title.length > 33) {
            showError('The title length must not exceed 33 characters!');
        } else if (description < 33 || description > 450) {
            showError(`The description length must not exceed 450 characters and should be at least 30!`);
        } else if (brand.length > 11) {
            showError('The brand length must not exceed 11 characters!');
        } else if (model.length > 11) {
            showError('The model length must not exceed 11 characters!');
        } else if (fuel.length > 11) {
            showError('The fuelType length must not exceed 11 characters!');
        } else if (model.length < 4) {
            showError('The model length should be at least 4 characters!');
        } else if (year.length !== 4) {
            showError('The year must be only 4 chars long!');
        } else if (Number(price) > 1000000) {
            showError('The maximum price is 1000000$');
        } else if (!imageUrl.startsWith('http')) {
            showError('Link url should always start with "http".');
        } else if (title.length === 0 || description.length === 0 || brand.length === 0
            || model.length === 0 || year.length === 0 || imageUrl.length === 0
            || fuel.length === 0 || price.length === 0) {
            showError('Fill inputs!');
        } else {
            let data = { brand, description, fuel, imageUrl, model, price,
                seller: sessionStorage.getItem('username'), title, year };
            await remote.post('appdata', `cars`, 'kinvey', data);
            await showCars();
            showInfo('listing created.');
        }
    } catch (err) {
        handleAjaxError(err);
    }
}

function showEditCar(car) {
    let form = $('#edit-listing form');
    form.trigger("reset");
    form.find('input[name="carId"]').val(car._id);
    form.find('input[name="title"]').val(car.title);
    form.find('input[name="description"]').val(car.description);
    form.find('input[name="brand"]').val(car.brand);
    form.find('input[name="model"]').val(car.model);
    form.find('input[name="year"]').val(car.year);
    form.find('input[name="imageUrl"]').val(car.imageUrl);
    form.find('input[name="fuelType"]').val(car.fuel);
    form.find('input[name="price"]').val(car.price);

    showView('edit-listing');
}
async function editCar() {
    try {
        let form = $('#edit-listing form');
        let carId = form.find('input[name="carId"]').val();
        let title = form.find('input[name="title"]').val();
        let description = form.find('input[name="description"]').val();
        let brand = form.find('input[name="brand"]').val();
        let model = form.find('input[name="model"]').val();
        let year = form.find('input[name="year"]').val();
        let imageUrl = form.find('input[name="imageUrl"]').val();
        let fuel = form.find('input[name="fuelType"]').val();
        let price = form.find('input[name="price"]').val();

        if (title.length > 33) {
            showError('The title length must not exceed 33 characters!');
        } else if (description < 33 || description > 450) {
            showError(`The description length must not exceed 450 characters and should be at least 30!`);
        } else if (brand.length > 11) {
            showError('The brand length must not exceed 11 characters!');
        } else if (model.length > 11) {
            showError('The model length must not exceed 11 characters!');
        } else if (fuel.length > 11) {
            showError('The fuelType length must not exceed 11 characters!');
        } else if (model.length < 4) {
            showError('The model length should be at least 4 characters!');
        } else if (year.length !== 4) {
            showError('The year must be only 4 chars long!');
        } else if (Number(price) > 1000000) {
            showError('The maximum price is 1000000$');
        } else if (!imageUrl.startsWith('http')) {
            showError('Link url should always start with "http".');
        } else if (title.length === 0 || description.length === 0 || brand.length === 0
            || model.length === 0 || year.length === 0 || imageUrl.length === 0
            || fuel.length === 0 || price.length === 0) {
            showError('Fill inputs!');
        } else {
            let data = { brand, description, fuel, imageUrl, model, price,
                seller: sessionStorage.getItem('username'), title, year };
            await remote.update('appdata', `cars/` + carId, 'kinvey', data);
            await showCars();
            showInfo(`Listing ${title} updated.`);
        }
    } catch (err) {
        handleAjaxError(err);
    }
}

async function deleteCar(carId) {
    try {
        await remote.remove('appdata', 'cars/' + carId, 'kinvey');
        await showCars();
        showInfo('Listing deleted.');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function detailsCar(car) {
    try {
        let detailsHtml = $('.listing-details .my-listing-details');
        detailsHtml.empty();
        let html = $('<p>').attr('id', 'auto-title').text(car.title)
            .append($('<img>').attr('src', car.imageUrl))
            .append($('<div>').addClass('listing-props')
                .append($('<h2>').text(`Brand: ${car.brand}`))
                .append($('<h3>').text(`Model: ${car.model}`))
                .append($('<h3>').text(`Year: ${car.year}`))
                .append($('<h3>').text(`Fuel: ${car.fuel}`))
                .append($('<h3>').text(`Price: ${car.price}$`)));

        if (car._acl .creator === sessionStorage.getItem('userId'))
        {
            html.append($('<div>').addClass('listings-buttons')
                .append($('<a>').attr('href', '#').addClass('button-list').text('Edit').on('click', showEditCar.bind(this, car)))
                .append($('<a>').attr('href', '#').addClass('button-list').text('Delete').on('click', deleteCar.bind(this, car._id))));
        }

        html.append($('<p>').attr('id', 'description-title').text('Description:'))
            .append($('<p>').attr('id', 'description-para').text(car.description));
        detailsHtml.append(html);

        showView('.listing-details');
    } catch (err) {
        handleAjaxError(err);
    }
}

async function myCars() {
    try {
        let username = sessionStorage.getItem('username');
        let myCars = await remote.get('appdata', `cars?query={"seller":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');

        let myCarHtml = $('.my-listings .car-listings');
        myCarHtml.empty();
        if(myCars.length === 0) {
            myCarHtml.append($('<p>').addClass('no-cars').text(' No cars in database.'));
        } else {
            for (let myCar of myCars) {
                let html = $('<div>').addClass('my-listing');
                html.append($('<p>').attr('id', 'listing-title').text(myCar.title))
                    .append($('<img>').attr('src', myCar.imageUrl))
                    .append($('<div>').addClass('listing-props')
                        .append($('<h2>').text(`Brand: ${myCar.brand}`))
                        .append($('<h3>').text(`Model: ${myCar.model}`))
                        .append($('<h3>').text(`Year: ${myCar.year}`))
                        .append($('<h3>').text(`Price: ${myCar.price}$`)))
                    .append($('<div>').addClass('my-listing-buttons')
                        .append($('<a>').attr('href', '#').addClass('my-button-list').text('Details').on('click', detailsCar.bind(this, myCar))));

                if (myCar._acl.creator === sessionStorage.getItem('userId')) {
                    html.find('.my-listing-buttons')
                        .append($('<a>').attr('href', '#').addClass('my-button-list').text('Edit').on('click', showEditCar.bind(this, myCar)))
                        .append($('<a>').attr('href', '#').addClass('my-button-list').text('Delete').on('click', deleteCar.bind(this, myCar._id)));
                }
                myCarHtml.append(html);
            }
        }
        showView('.my-listings');
    } catch (err) {
        handleAjaxError(err);
    }
}

function signInUser(res, message) {
    saveAuthInSession(res);
    showUserHome();
    showHideMenuLinks();
    showInfo(message);
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}