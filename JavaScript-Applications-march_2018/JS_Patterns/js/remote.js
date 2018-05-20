let remote = (function () {
    const APP_KEY = 'kid_Sy8Tyqh2G';
    const APP_SECRET = 'f52ecf732385445cb3aab18fcad0bd3c';
    const URL = 'https://baas.kinvey.com';

    function getAuth(typeOfAuth) {
        if (typeOfAuth === 'Basic'){
            return 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET);
        } else {
            return 'Kinvey ' + sessionStorage.getItem('authToken');
        }
    }

    function makeRequest(method, typeOfMethod, endUrl, typeOfAuth) {
        return {
            method: method,
            url: `${URL}/${typeOfMethod}/${APP_KEY}/${endUrl}`,
            headers: {
                'Authorization': getAuth(typeOfAuth)
            }
        };
    }

    function get(typeOfMethod, endUrl, typeOfAuth) {
        return $.ajax(makeRequest('GET', typeOfMethod, endUrl, typeOfAuth));
    }

    function post(typeOfMethod, endUrl, typeOfAuth, data) {
        let request = makeRequest('POST', typeOfMethod, endUrl, typeOfAuth);
        if (data) {
            request.data = data;
        }
        return $.ajax(request);
    }

    function put(typeOfMethod, endUrl, typeOfAuth, data) {
        let request = makeRequest('PUT', typeOfMethod, endUrl, typeOfAuth);
        request.data = data;
        return $.ajax(request);
    }

    function del(typeOfMethod, endUrl, typeOfAuth) {
        return $.ajax(makeRequest('DELETE', typeOfMethod, endUrl, typeOfAuth));
    }
    return {
        get, post, put, del
    };
})();