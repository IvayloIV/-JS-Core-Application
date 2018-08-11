function startApp() {
    showHideMenuLinks()
    if (sessionStorage.getItem('authToken')) {
        showHome()
    } else {
        showLoginView();
    }
    attachAllEvents()
}
