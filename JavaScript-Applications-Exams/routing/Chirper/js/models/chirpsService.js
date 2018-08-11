let chirpsService = (() => {
    function getAllChirps() {
        let subs = sessionStorage.getItem('subscriptions');
        return remote.get(`appdata`, `chirps?query={"author":{"$in": ${subs}}}&sort={"_kmd.ect": 1}`, 'kinvey');
    }
    function createChirp(text) {
        let author = sessionStorage.getItem('username');
        let data = {text, author};
        return remote.post('appdata', `chirps`, 'kinvey', data);
    }
    function deleteChirp(chirpId) {
        return remote.remove('appdata', `chirps/${chirpId}`, 'kinvey');
    }
    function countChirps(username) {
        return remote.get('appdata', `chirps?query={"author":"${username}"}`, 'kinvey');
    }
    function following(username) {
        return remote.get('user', `?query={"username":"${username}"}`, 'kinvey');
    }
    function followers(username) {
        return remote.get('user', `?query={"subscriptions":"${username}"}`, 'kinvey');
    }
    function discoverPage() {
        return remote.get('user', ``, 'kinvey');
    }
    function follow(followPerson) {
        let subs = JSON.parse(sessionStorage.getItem('subscriptions'));
        if (subs.indexOf(followPerson) === -1) {
            subs.push(followPerson);
        }
        sessionStorage.setItem('subscriptions', JSON.stringify(subs));
        return remote.update('user', sessionStorage.getItem('userId'), 'kinvey', {subscriptions: subs});
    }
    function unFollow(unFollowPerson) {
        let subs = JSON.parse(sessionStorage.getItem('subscriptions'));
        let index = subs.indexOf(unFollowPerson);
        if (index !== -1) {
            subs.splice(index, 1);
        }
        sessionStorage.setItem('subscriptions', JSON.stringify(subs));
        return remote.update('user', sessionStorage.getItem('userId'), 'kinvey', {subscriptions: subs});
    }
    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    return {
        getAllChirps,
        createChirp,
        deleteChirp,
        countChirps,
        following,
        followers,
        discoverPage,
        calcTime,
        follow,
        unFollow
    };
})();