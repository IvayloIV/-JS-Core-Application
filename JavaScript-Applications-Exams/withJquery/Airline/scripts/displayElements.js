function showView(viewName) {
    $('#container > section').hide();
    $('#' + viewName).show(); // Show the selected view only
}

function showHideMenuLinks() {
    $('.right-container span').text("");
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $(".left-container ul li:nth-of-type(3)").show();
        $(".left-container ul li:nth-of-type(4)").show();
        $(".left-container ul li:nth-of-type(1)").hide();
        $(".left-container ul li:nth-of-type(2)").hide();
        $('.right-container').hide();
    } else { // We have logged in user
        $(".left-container ul li:nth-of-type(3)").hide();
        $(".left-container ul li:nth-of-type(4)").hide();
        $(".left-container ul li:nth-of-type(1)").show();
        $(".left-container ul li:nth-of-type(2)").show();
        $('.right-container').show();
        $('.right-container span').text("Welcome, " + sessionStorage.getItem('username') + "!");
    }
}

function showInfo(message) {
    let infoBox = $('#infoBox');
    infoBox.find('span').text(message);
    infoBox.show();
    setTimeout(function() {
        $('#infoBox').fadeOut()
    }, 3000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox');
    errorBox.find('span').text("Error: " + errorMsg);
    errorBox.show();
	setTimeout(function() {
        $('#errorBox').fadeOut();
    }, 3000)
}

function showLoginView() {
    showView('viewLogin');
    $('#formLogin').trigger('reset');
}

function showRegisterView() {
    $('#formRegister').trigger('reset');
    showView('viewRegister');
}

function showCreateFlight() {
    $('#formAddFlight').trigger('reset');
    showView('viewAddFlight');
}