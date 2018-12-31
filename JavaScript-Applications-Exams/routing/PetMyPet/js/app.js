$(() => {
    const app = new Sammy("#container", function () {
        this.use('Handlebars', 'hbs');
		
		this.get('index.html', welcomePage);
		this.get('#/index', welcomePage);

        this.get('#/register', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }

            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                formRegister: './templates/register/formRegister.hbs'
            }).then(function () {
                this.partial('./templates/register/mainRegister.hbs');
            })
        });
        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (username.length < 3) {
                notify.showError('Username must be at least 3 symbols');
            } else if (password.length < 6) {
                notify.showError('Password must be at least 6 symbols');
            } else {
                auth.register(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        notify.showInfo('User registration successful.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/login', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }

            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                formLogin: './templates/login/formLogin.hbs'
            }).then(function () {
                this.partial('./templates/login/mainLogin.hbs');
            })
        });
        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            if (username.length < 3) {
                notify.showError('Username must be at least 3 symbols');
            } else if (password.length < 6) {
                notify.showError('Password must be at least 6 symbols');
            } else {
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        notify.showInfo('Login successful.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/logout', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            auth.logout()
                .then(function () {
                    sessionStorage.clear();
					notify.showInfo('Logout successful.');
                    ctx.partials = this.partials;
                    ctx.redirect('#/index');
                })
                .catch(notify.handleError)
        });

        this.get('#/home', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            petService.getPets()
                .then(function (allPets) {
                    let notMyPets = [];
                    let userId = sessionStorage.getItem('userId');

                    for (let pet of allPets.sort((a, b) => Number(b['likes']) - Number(a['likes']))) {
                        if (pet._acl.creator !== userId) {
                            notMyPets.push(pet);
                        }
                    }

                    ctx.pets = notMyPets;
                    ctx.isAuth = isAuth;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        pets: './templates/home/pets.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/mainHome.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/like/:petId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            let petId = this.params.petId;
            petService.getPet(petId)
                .then(function (currentPet) {
                    currentPet['likes'] = (Number(currentPet['likes']) + 1).toString();

                    petService.editPet(petId, currentPet)
                        .then(function () {
                            history.back();
                        })
                        .catch(notify.handleError);
                })
                .catch(notify.handleError);
        });
        this.get('#/detailsOtherPet/:petId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            let userId = sessionStorage.getItem('userId');
            let petId = this.params.petId;
            petService.getPet(petId)
                .then(function (currentPet) {
                    if (currentPet._acl.creator === userId) {
                        ctx.redirect('#/home');
                    }
                    else {
                        ctx.pet = currentPet;
                        ctx.isAuth = isAuth;
                        ctx.username = sessionStorage.getItem('username');
                        ctx.loadPartials({
                            header: './templates/common/header.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            ctx.partials = this.partials;
                            ctx.partial('./templates/detailsOtherPet/mainDetailsOtherPet.hbs');
                        })
                    }
                })
                .catch(notify.handleError);
        });
        this.get('#/pets/:category', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            let userId = sessionStorage.getItem('userId');
            let category = this.params.category;
            petService.getPets()
                .then(function (allPets) {
                    let notMyPets = [];
                    for (let pet of allPets.sort((a, b) => Number(b['likes']) - Number(a['likes']))) {
                        if (pet._acl.creator !== userId && pet.category === category) {
                            notMyPets.push(pet);
                        }
                    }

                    ctx.pets = notMyPets;
                    ctx.isAuth = isAuth;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        pets: './templates/home/pets.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/home/mainHome.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/addPet', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            this.isAuth = isAuth;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                formAddPet: './templates/addPet/formAddPet.hbs'
            }).then(function () {
                ctx.partials = this.partials;
                ctx.partial('./templates/addPet/mainAddPet.hbs');
            });
        });
        this.post('#/addPet', function (ctx) {
            let name = this.params.name;
            let description = this.params.description;
            let imageURL = this.params.imageURL;
            let category = this.params.category;

            if (name === '' || description === '' || imageURL === "") {
                notify.showError('Fill empty inputs!');
            }  else {
                petService.createPet(name, description, imageURL, category)
                    .then(function () {
                        notify.showInfo('Pet created.');
                        ctx.partials = this.partials;
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/myPets', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            petService.myPets()
                .then(function (myPets) {
                    ctx.myPets = myPets;
                    ctx.isAuth = isAuth;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        myPets: './templates/myPets/myPets.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/myPets/mainMyPets.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.get('#/editPet/:petId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            let petId = this.params.petId;
            petService.getPet(petId)
                .then(function (pet) {
                    ctx.pet = pet;
                    ctx.isAuth = isAuth;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        formEditPet: './templates/editPet/formEditPet.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/editPet/mainEditPet.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.post('#/editPet/:petId', function (ctx) {
            let description = this.params.description;
            let petId = this.params.petId;

            if (description === '') {
                notify.showError('Empty description!');
            }  else {
                petService.getPet(petId)
                    .then(function (pet) {
                        pet.description = description;
                        petService.editPet(petId, pet)
                            .then(function () {
                                notify.showInfo('Updated successfully!');
                                ctx.partials = this.partials;
                                ctx.redirect('#/home');
                            })
                            .catch(notify.handleError);
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/deletePet/:petId', function (ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (!isAuth) {
                this.redirect('#/index');
                return;
            }

            let petId = this.params.petId;
            petService.getPet(petId)
                .then(function (pet) {
                    ctx.pet = pet;
                    ctx.isAuth = isAuth;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        formDeletePet: './templates/deletePet/formDeletePet.hbs'
                    }).then(function () {
                        ctx.partials = this.partials;
                        ctx.partial('./templates/deletePet/mainDeletePet.hbs');
                    })
                })
                .catch(notify.handleError);
        });
        this.post('#/deletePet/:petId', function (ctx) {
            let petId = this.params.petId;

            petService.deletePet(petId)
                .then(function () {
                    notify.showInfo('Pet removed successfully!');
                    ctx.partials = this.partials;
                    ctx.redirect('#/myPets');
                })
                .catch(notify.handleError);
        });

		function welcomePage(ctx) {
            let isAuth = sessionStorage.getItem('authtoken');
            if (isAuth) {
                this.redirect('#/home');
                return;
            }

            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/index.hbs');
            });
        }
    });
    app.run();
});