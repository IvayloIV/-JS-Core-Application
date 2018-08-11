function loginUser() {
    let username = $('#login-form input[name="username-login"]').val();
    let password = $('#login-form input[name="password-login"]').val();

    if (username.length < 5) {
        showError('Too short username!');
    } else if (password === '') {
        showError('Empty password!');
    } else {
        remote.post('user', 'login', 'basic', {username, password})
            .then(function (currentUser) {
                signInUser(currentUser, 'Login successful.');
            }).catch(handleAjaxError);
    }
}
function registerUser() {
    let username = $('#register-form input[name="username-register"]').val();
    let password = $('#register-form input[name="password-register"]').val();
    let repeatPass = $('#register-form input[name="password-register-check"]').val();

    if (username.length < 5) {
        showError('Too short username!');
    } else if (password === '') {
        showError('Empty password!');
    } else if (password !== repeatPass) {
        showError('Passwords does not match!');
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
        showHomeView();
        showHideMenuLinks();
        showInfo('Logout successful.');
    }).catch(handleAjaxError);
}

async function viewHome() {
    try {
        let userId = sessionStorage.getItem('userId');
        let activeReceipt = await remote.get(`appdata`, `receipts?query={"_acl.creator":"${userId}","active":"true"}`, 'kinvey');
        if (activeReceipt.length === 0) {
            activeReceipt = await remote.post('appdata', `receipts`, 'kinvey', {
                active: true,
                productCount: 0,
                total: 0
            });
        } else {
            activeReceipt = activeReceipt[0];
        }
        let entries = await remote.get('appdata', `entries?query={"receiptId":"${activeReceipt._id}"}`, 'kinvey');
        let entriesHtml = $('#create-receipt-view #active-entries');
        entriesHtml.empty();
        $('#create-entry-form').trigger('reset');
        let totalSum = 0;
        for (let entry of entries) {
            let sum = (Number(entry.price) * Number(entry.qty));
            totalSum += sum;
            entriesHtml.append($('<div>').addClass('row')
                .append($('<div>').addClass('col wide').text(entry.type))
                .append($('<div>').addClass('col wide').text(entry.qty))
                .append($('<div>').addClass('col wide').text(Number(entry.price).toFixed(2)))
                .append($('<div>').addClass('col').text(sum.toFixed(2)))
                .append($('<div>').addClass('col right')
                    .append($('<a>').attr('href', '#').html('&#10006;').on('click', deleteEntry.bind(this, entry)))));
        }
        let tableFood = $('#create-receipt-view #create-receipt-form');
        tableFood.find('.col.wide.right').next().text(totalSum.toFixed(2));
        tableFood.find('input[name="receiptId"]').val(activeReceipt._id);
        tableFood.find('input[name="productCount"]').val(entries.length);
        tableFood.find('input[name="total"]').val(totalSum);
        showView('create-receipt-view');

    }catch (err) {
        handleAjaxError(err);
    }
}
async function createEntry() {
    try {
        let type = $('#create-entry-form input[name="type"]').val();
        let qty = $('#create-entry-form input[name="qty"]').val();
        let price = $('#create-entry-form input[name="price"]').val();
        let receiptId = $('#create-receipt-form input[name="receiptId"]').val();

        if (type === '') {
            showError('Empty name!');
        } else if (isNaN(Number(qty)) || qty.length === 0) {
            showError('Quantity is not a number!');
        } else if (isNaN(Number(price)) || price.length === 0) {
            showError('Price is not a number!');
        } else {
            await remote.post('appdata', `entries`, 'kinvey', {
                type, price, qty, receiptId
            });
            showInfo('Entry added.');
            viewHome();
        }
    } catch (err) {
        handleAjaxError(err);
    }
}
async function deleteEntry(entry) {
    try {
        await remote.remove('appdata', 'entries/' + entry._id, 'kinvey');
        showInfo('Entry removed.');
        viewHome();
    } catch (err) {
        handleAjaxError(err);
    }
}
async function checkOut() {
    try {
        let receiptId = $('#create-receipt-form input[name="receiptId"]').val();
        let productCount = $('#create-receipt-form input[name="productCount"]').val();
        let total = $('#create-receipt-form input[name="total"]').val();
        if (productCount === '0') {
            showError('Empty receipt!');
            return;
        }
        await remote.update('appdata', `receipts/${receiptId}`, 'kinvey', {
            active: false,
            productCount: productCount,
            total: total
        });
        showInfo('Receipt checked out');
        viewHome();
    } catch (err) {
        handleAjaxError(err);
    }
}

async function allReceipts() {
    try {
        let userId = sessionStorage.getItem('userId');
        let receipts = await remote.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"}`, 'kinvey');
        let table = $('#all-receipt-view');
        table.find('.table > div.row').remove();
        let totalSum = 0;
        for (let receipt of receipts) {
            let date = new Date(receipt._kmd.ect);
            let year = date.getFullYear();
            let month = ('0' + date.getMonth()).slice(-2);
            let day = ('0' + date.getDate()).slice(-2);
            let hours = ('0' + date.getHours()).slice(-2);
            let minutes = ('0' + date.getMinutes()).slice(-2);
            let sum = Number(receipt.total) * Number(receipt.productCount);
            totalSum += sum;
            let newRow = $('<div>').addClass('row')
                .append($('<div>').addClass('col wide').text(`${year}-${month}-${day} ${hours}:${minutes}`))
                .append($('<div>').addClass('col wide').text(receipt.productCount))
                .append($('<div>').addClass('col').text(Number(sum).toFixed(2)))
                .append($('<div>').addClass('col')
                    .append($('<a>').attr('href', '#').text('Details').on('click', showDetails.bind(this, receipt))));
            newRow.insertAfter(table.find('.table .table-head'));
        }
        table.find('.table-foot .col.wide.right').next().text(totalSum.toFixed(2));
        showView('all-receipt-view');
    } catch (err) {
        handleAjaxError(err);
    }
}
async function showDetails(receipt) {
    try {
        let entries = await remote.get('appdata', `entries?query={"receiptId":"${receipt._id}"}`, 'kinvey');
        let table = $('#receipt-details-view .table');
        table.find('.row').remove();
        for (let entry of entries) {
            let sum = Number(entry.qty) * Number(entry.price);
            table.append($('<div>').addClass('row')
                .append($('<div>').addClass('col wide').text(entry.type))
                .append($('<div>').addClass('col wide').text(entry.qty))
                .append($('<div>').addClass('col wide').text(Number(entry.price).toFixed(2)))
                .append($('<div>').addClass('col').text(sum.toFixed(2))));
        }
        showView('receipt-details-view');
    } catch (err) {
        handleAjaxError(err);
    }
}

function signInUser(res, message) {
    saveAuthInSession(res);
    viewHome();
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