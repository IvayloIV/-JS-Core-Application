let memeService = (() => {
    function allMemes() {
        return remote.get('appdata', `memes?query={}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    
    function createMeme(creator, title, description, imageUrl) {
        let data = {creator, title, description, imageUrl};
        return remote.post('appdata', `memes`, 'kinvey', data);
    }
    
    function editMeme(memeId, creator, title, description, imageUrl) {
        let data = {creator, title, description, imageUrl};
        return remote.update('appdata', `memes/${memeId}`, 'kinvey', data);
    }

    function deleteMeme(memeId) {
        return remote.remove('appdata', `memes/${memeId}`, 'kinvey');
    }
    
    function userMemes(username) {
        return remote.get('appdata', `memes?query={"creator":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }

    function currentMeme(memeId) {
        return remote.get('appdata', `memes/${memeId}`, 'kinvey');
    }

    return {
        allMemes,
        createMeme,
        editMeme,
        deleteMeme,
        userMemes,
        currentMeme
    }
})();