let chirps = (function () {
    function allChirps(subs) {
        return remote.get('appdata', `chirps?query={"author":{"$in": ${subs}}}&sort={"_kmd.ect": 1}`, 'kinvey');
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
    function createChirps(text, author) {
        let data = {text, author};
        return remote.post('appdata', `chirps`, 'kinvey', data);
    }
    function myChirps(username) {
        return remote.get('appdata', `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`, 'kinvey');
    }
    function deleteChirps(id) {
        return remote.remove('appdata', `chirps/${id}`, 'kinvey');
    }
    function discover() {
        return remote.get('user', ``, 'kinvey');
    }
    function follow(userId, addedName) {
        let allUsersSess = JSON.parse(sessionStorage.getItem('subscriptions'));
        allUsersSess.push(addedName);
        sessionStorage.setItem('subscriptions', JSON.stringify(allUsersSess));
        let data = {subscriptions : allUsersSess};
        return remote.update('user', userId, 'kinvey', data);
    }
    function unfollow(userId, addedName) {
        let allUsersSess = JSON.parse(sessionStorage.getItem('subscriptions'));
        let index = allUsersSess.indexOf(addedName);
        allUsersSess.splice(index, 1);
        sessionStorage.setItem('subscriptions', JSON.stringify(allUsersSess));
        let data = {subscriptions : allUsersSess};
        return remote.update('user', userId, 'kinvey', data);
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
        allChirps,
        calcTime,
        countChirps,
        following,
        followers,
        createChirps,
        myChirps,
        deleteChirps,
        discover,
        follow,
        unfollow
    };
})();