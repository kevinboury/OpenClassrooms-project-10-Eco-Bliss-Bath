
describe('Tests API - EcoBlissBath', () => {

    const id_produit_dispo = 5;
    const id_produit_en_rupture = 3;

    it("API-001 - Teste si l'API est en ligne", () => {
        cy.request('GET', 'http://localhost:8081/api/health').then((response) => {
            expect(response.status).to.eq(200);
        });
    });

    it("API-002a - Se connecte avec des identifiants valides", () => {
        // cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
        //     cy.request(
        //         {
        //             method: 'POST',
        //             url: 'http://localhost:8081/login',
        //             body: {
        //                 username: testEmail,
        //                 password:
        //                 testPassword
        //             }
        //         }
        //     ).then((response) => {
        //         expect(response.status).to.eq(200);

        //         const token = response.body.token;
        //         expect(token).to.be.a('string');
        //     });
        // });

        cy.loginApi();
    });

    it("API-002b - Se connecte avec des identifiants incorrects", () => {
        cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
            cy.request(
                {
                    method: 'POST',
                    url: 'http://localhost:8081/login',
                    body: {
                        username: testEmail,
                        password: "mauvais_mdp"},
                    failOnStatusCode: false
                }
            ).then((response) => {
                expect(response.status).to.eq(401);
            });
        });
    });
    
    it("API-003 - Crée un nouveau compte", () => {
        const email = `test_cypress_${Date.now()}@test.fr`;
        cy.request(
            {
                method: 'POST',
                url: 'http://localhost:8081/register',
                body: {
                    email: email,
                    firstname: "Prénom",
                    lastname: "Nom",
                    plainPassword: {
                        first: "testtest",
                        second: "testtest"
                    }
                },
            }
        ).then((response) => {
            cy.log(JSON.stringify(response.body));

            expect(response.status).to.eq(200);
            expect(response.body.email).to.eq(email);
        });
    });
    
    it("API-004 - Obtient des informations sur le compte utilisateur", () => {
        // cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
        //     cy.request(
        //         {
        //             method: 'POST',
        //             url: 'http://localhost:8081/login',
        //             body: {
        //                 username:testEmail, password:testPassword
        //             }
        //         }
        //     ).then((response) => {
        //         expect(response.status).to.eq(200);

        //         const token = response.body.token;
        //         expect(token).to.be.a('string');
                
        //         cy.request(
        //             {
        //                 method: 'GET',
        //                 url: 'http://localhost:8081/me',
        //                 auth: { bearer: token }
        //             }
        //         ).then((response) => {
        //             expect(response.status).to.eq(200);
        //         });
        //     });
        // });
        
        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'GET',
                    url: 'http://localhost:8081/me',
                    auth: { bearer: token }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });

    it('API-010 - Récupère le catalogue des produits', () => {

        cy.request('GET', 'http://localhost:8081/products').then((response) => {

            // Vérifier le code HTTP
            expect(response.status).to.eq(200);

            // Vérifier que la réponse est un tableau
            expect(response.body).to.be.an('array');

            // Vérifier que le tableau n'est pas vide
            expect(response.body.length).to.be.greaterThan(0);

        });

    });

    it('API-011 - Récupère 3 produits aléatoires', () => {

        cy.request('GET', 'http://localhost:8081/products/random').then((response) => {

            // // Vérifier le code HTTP
            // expect(response.status).to.eq(200);

            // // Vérifier que la réponse est un tableau
            // expect(response.body).to.be.an('array');

            // // Vérifier que le tableau n'est pas vide
            // expect(response.body.length).to.be.greaterThan(0);

        });

    });
    
    it('API-012a - Récupère les informations d’un produit spécifique', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/products/3'
        }).then((response) => {
            expect(response.status).to.eq(200);

            // Affiche le stock de ce produit
            cy.log(JSON.stringify(response.body.availableStock))
        })
    })

    //Par défaut, cy.request() considère un code HTTP 4xx ou 5xx comme un échec de commande. L'option failOnStatusCode: false permet de vérifier volontairement ces réponses
    it('API-012b - Tente de récupérer les informations d’un produit inexistant', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/products/999999',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        })
    })

    
    it("API-005a - Ajoute un produit disponible en stock au panier", () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/products/3'
        }).then((response) => {
            expect(response.status).to.eq(200);

            // Affiche le stock de ce produit
            const stock = parseInt(JSON.stringify(response.body.availableStock));
            cy.log(`stock produit n°${id_produit_dispo} : ${stock})`);
        })

        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: id_produit_dispo,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });

    it("API-005b - Ajoute un produit en rupture de stock au panier", () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/products/3'
        }).then((response) => {
            expect(response.status).to.eq(200);

            // Affiche le stock de ce produit
            const stock = parseInt(JSON.stringify(response.body.availableStock));
            cy.log(`stock produit n°${id_produit_en_rupture} : ${stock})`);
        })

        
        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: id_produit_en_rupture,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(409); // code d'erreur à définir
            });
        });
    });

    it("API-008a - Liste les produits du panier dans le cas d'un utilisateur connecté", () => {
        cy.loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: id_produit_dispo,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);

                cy.request(
                    {
                        method: 'GET',
                        url: 'http://localhost:8081/orders',
                        auth: { bearer: token }
                    }
                ).then((response) => {
                    expect(response.status).to.eq(200);

                    cy.log(JSON.stringify(response.body.orderLines, null, 2))
                })
            })
        })
    });

    it("API-008b - Liste les produits du panier dans le cas d'un utilisateur non connecté", () => {
        cy.request(
            {
                method: 'GET',
                url: 'http://localhost:8081/orders',
                failOnStatusCode: false
            }
        ).then((response) => {
            expect(response.status).to.eq(401);
        })
    });
    
    it("API-006a - Change la quantité du produit (disponible) dans le panier", () => {
        cy.loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: id_produit_dispo,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
                
                const id_ligne_du_panier_a_modifier = JSON.stringify(response.body.orderLines[0].id);
                cy.log("id_ligne_du_panier_a_modifier: " + id_ligne_du_panier_a_modifier)

                //changement de la quantité
                cy.request(
                    {
                        method: 'PUT',
                        url: `http://localhost:8081/orders/${id_ligne_du_panier_a_modifier}/change-quantity`,
                        auth: { bearer: token },
                        body: {
                            "quantity": 1
                        },
                    }
                ).then( (response) => {
                    expect(response.status).to.eq(200);
                });
            });
        })
    });

    it("API-006b - Essaie de changer la quantité d’un produit absent du panier", () => {
        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/99999/change-quantity',
                    auth: { bearer: token },
                    body: {
                        "quantity": 0
                    },
                    failOnStatusCode: false
                }).then( (response) => {
                    expect(response.status).to.eq(404);
            });
        })
    });
    
    it("API-007 - Supprime un produit du panier", () => {
        cy.loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: id_produit_dispo,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
                
                const id_ligne_du_panier_a_supprimer = JSON.stringify(response.body.orderLines[0].id);
                cy.log("id_ligne_du_panier_a_supprimer: " + id_ligne_du_panier_a_supprimer)

                //suppression du produit
                cy.request(
                    {
                        method: 'DELETE',
                        url: `http://localhost:8081/orders/${id_ligne_du_panier_a_supprimer}/delete`,
                        auth: { bearer: token }
                    }
                ).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        })
    });


    
    it("API-009a - Valide la commande pour le panier en cours, dans le cas où tous les produits sont disponibles", () => {
        //produit

        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'POST',
                    url: 'http://localhost:8081/orders',
                    auth: { bearer: token },
                    body: {
                        "firstname": "Prénom",
                        "lastname": "Nom",
                        "address": "Adresse",
                        "zipCode": "33333",
                        "city": "Ville"
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
            })
        })
    });

    it("API-009b - Valide la commande pour le panier en cours, dans le cas où un produit n’est pas disponible", () => {
        // produit
        
        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'POST',
                    url: 'http://localhost:8081/orders',
                    auth: { bearer: token },
                    body: {
                        "firstname": "Prénom",
                        "lastname": "Nom",
                        "address": "Adresse",
                        "zipCode": "33333",
                        "city": "Ville"
                    },
                    failOnStatusCode: false
                }
            ).then((response) => {
                expect(response.status).to.eq(404); // code à définir
            })
        })
    });


    it('API-013 - Récupère les avis postés sur le site', () => {
        // cy.request({
        //     method: 'GET',
        //     url: 'http://localhost:8081/api/products/999999',
        //     failOnStatusCode: false
        // }).then((response) => {
        //     expect(response.status).to.eq(404);
        // })
    })

    it('API-014 - Crée un nouvel avis', () => {
        // cy.request({
        //     method: 'GET',
        //     url: 'http://localhost:8081/api/products/999999',
        //     failOnStatusCode: false
        // }).then((response) => {
        //     expect(response.status).to.eq(404);
        // })
    })

});


