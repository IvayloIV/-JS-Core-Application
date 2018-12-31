let petService = (() => {
    function getPets() {
        return remote.get('appdata', 'pets?query={}&sort={"likes": -1}', 'kinvey');
    }

    function getPet(petId) {
        return remote.get('appdata', `pets/${petId}`, 'kinvey');
    }
    
    function createPet(name, description, imageURL, category) {
        let obj = {name, description, imageURL, category, likes: '0'};

        return remote.post('appdata', 'pets', 'kinvey', obj);
    }
    
    function editPet(petId, pet) {
        return remote.update('appdata', `pets/${petId}`, 'kinvey', pet);
    }
    
    function deletePet(petId) {
        return remote.remove('appdata', `pets/${petId}`, 'kinvey');
    }

    function myPets() {
        let userId = sessionStorage.getItem('userId');

        return remote.get('appdata', `pets?query={"_acl.creator":"${userId}"}`, 'kinvey');
    }

    return {
        getPets,
        createPet,
        editPet,
        deletePet,
        myPets,
        getPet
    }
})();