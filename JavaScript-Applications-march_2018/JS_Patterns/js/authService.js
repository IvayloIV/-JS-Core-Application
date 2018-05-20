let auth = (function () {
    function isAuth() {
        return sessionStorage.getItem('authToken') !== null;
    }

    function saveSession(user) {
        sessionStorage.setItem('authToken', user._kmd.authtoken);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('userId', user._id);
    }

    async function register(username, password) {
        let data = {username, password};
        return await remote.post('user', '', 'Basic', data)
    }

    async function login(username, password) {
        let data = {username, password};
        return await remote.post('user', 'login', 'Basic', data);
    }
    async function logout() {
        return await remote.post('user', '_logout', 'Kinvey');
    }

    return {
        register,
        login,
        logout,
        saveSession,
        isAuth
    };
})();