function startApp() {
    showHideMenuLinks()
    if (sessionStorage.getItem('authToken')) {
        showUserHome()
    } else {
        showHomeView();
    }
    attachAllEvents()
}
