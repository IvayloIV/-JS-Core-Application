function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="password"]').val();
	remote.post('user', 'login', 'basic', {username, password})
    .then(function (currentUser) {
        signInUser(currentUser, 'Login successful.');
    }).catch(handleAjaxError);
}
function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="password"]').val();
    let name = $('#formRegister input[name="name"]').val();
	remote.post('user', '', 'basic', {username, password, name})
    .then(function (currentUser) {
        signInUser(currentUser, 'User registration successful.');
    }).catch(handleAjaxError);
}
function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('name', userInfo.name);
}
function logoutUser() {
	remote.post('user', '_logout', 'kinvey')
    .then(function () {
        sessionStorage.clear();
        showHomeView();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

function shop() {
    remote.get('appdata', `products`, 'kinvey')
        .then(function (products) {
            let shopHtmlBody = $('#viewShop tbody');
            shopHtmlBody.empty();
            for (let product of products) {
                shopHtmlBody.append($('<tr>')
                    .append($('<td>').text(product.name))
                    .append($('<td>').text(product.description))
                    .append($('<td>').text(Number(product.price).toFixed(2)))
                    .append($('<td>')
                        .append($('<button>').text('Purchase').on('click', purchaseProduct.bind(this, product)))));
            }
            showView('viewShop');
        })
        .catch(handleAjaxError);
}
function purchaseProduct(product) {
    getCurrentUser()
        .then(function (userInfo) {
            let currentCart = {};
            if (userInfo.cart !== undefined){
                currentCart = userInfo.cart;
            }
            if (!currentCart.hasOwnProperty(product._id)){
                currentCart[product._id] = {
                    quantity: 1,
                    product: {
                        name: product.name,
                        description: product.description,
                        price: product.price
                    }
                };
            } else {
                currentCart[product._id]['quantity'] = Number(currentCart[product._id]['quantity']) + 1;
            }
            userInfo.cart = currentCart;
            remote.update('user', sessionStorage.getItem('userId'), 'kinvey', userInfo)
                .then(function () {
                    showInfo('Product purchased.');
                    cart();
                })
                .catch(handleAjaxError);
        })
        .catch(handleAjaxError);
}
function cart() {
    getCurrentUser()
        .then(function (userInfo) {
            let cart = [];
            if (userInfo.cart !== undefined){
                cart = userInfo.cart;
            }
            let cartHtmlBody = $('#viewCart tbody');
            cartHtmlBody.empty();
            for (let item of Object.entries(cart)) {
                cartHtmlBody.append($('<tr>')
                    .append($('<td>').text(item[1]['product']['name']))
                    .append($('<td>').text(item[1]['product']['description']))
                    .append($('<td>').text(Number(item[1]['quantity'])))
                    .append($('<td>').text((Number(item[1]['quantity']) * Number(item[1]['product']['price'])).toFixed(2)))
                    .append($('<td>')
                        .append($('<button>').text('Discard').on('click', removeProduct.bind(this, item)))));
            }
            showView('viewCart');
        })
        .catch(handleAjaxError);
}
function removeProduct(product) {
    getCurrentUser()
        .then(function (userInfo) {
            let currentCart = {};
            if (userInfo.cart !== undefined){
                currentCart = userInfo.cart;
            }
            if (currentCart.hasOwnProperty(product[0])){
                delete currentCart[product[0]]
            }
            userInfo.cart = currentCart;
            remote.update('user', sessionStorage.getItem('userId'), 'kinvey', userInfo)
                .then(function () {
                    showInfo('Product discarded.');
                    cart();
                })
                .catch(handleAjaxError);
        })
        .catch(handleAjaxError);
}

async function getCurrentUser() {
    return await remote.get('user', sessionStorage.getItem('userId'), 'kinvey');
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