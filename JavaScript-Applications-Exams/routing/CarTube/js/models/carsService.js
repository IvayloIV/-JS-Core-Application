let carsService = (() => {
    function listAllCars() {
        return remote.get('appdata', `cars?query={}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    function createCar(brand, description, fuel, imageUrl, model, price, seller,
                       title, year) {
        let data = {brand, description, fuel, imageUrl, model, price, seller,
            title, year};
        return remote.post('appdata', `cars`, 'kinvey', data);
    }
    function editCar(carId, brand, description, fuel, imageUrl, model, price, seller,
                     title, year) {
        let data = {brand, description, fuel, imageUrl, model, price, seller,
            title, year};
        return remote.update('appdata', `cars/${carId}`, 'kinvey', data);
    }
    function deleteCar(carId) {
        return remote.remove('appdata', `cars/${carId}`, 'kinvey')
    }
    function myCars(username) {
        return remote.get('appdata', `cars?query={"seller":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }
    function getCurrentCar(carId) {
        return remote.get('appdata', `cars/${carId}`, 'kinvey');
    }

    return {
        listAllCars,
        createCar,
        editCar,
        deleteCar,
        myCars,
        getCurrentCar
    }
})();