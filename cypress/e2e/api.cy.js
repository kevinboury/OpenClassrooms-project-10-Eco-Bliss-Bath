
import { loginApi } from '../support/tools'

describe('Tests API - EcoBlissBath', () => {

    const ID_PRODUIT_DISPO = 5;
    const ID_PRODUIT_EN_RUPTURE = 3;

    it("API-001 - Teste si l'API est en ligne", () => {
        cy.request(
            {
                method: 'GET',
                url: 'http://localhost:8081/api/health'
            }
        ).then((response) => {
            expect(response.status).to.eq(200);
        });
    });

    it("API-002a - Se connecte avec des identifiants valides", () => {
        loginApi();
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
        loginApi().then( (token) => {
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

    it('API-005 - Récupère le catalogue des produits', () => {
        cy.request('GET', 'http://localhost:8081/products').then((response) => {

            // Vérifie le code HTTP
            expect(response.status).to.eq(200);

            // Vérifie que la réponse est un tableau
            expect(response.body).to.be.an('array');

            // Vérifie que le tableau n'est pas vide
            expect(response.body.length).to.be.greaterThan(0);
        });
    });

    it('API-006 - Récupère 3 produits aléatoires', () => {
        cy.request('GET', 'http://localhost:8081/products/random').then((response) => {

            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.eq(3); 
        });
    });
    
    it('API-007a - Récupère les informations d’un produit spécifique', () => {
        cy.request({
            method: 'GET',
            url: `http://localhost:8081/products/${ID_PRODUIT_DISPO}`
        }).then((response) => {
            expect(response.status).to.eq(200);

            // Affiche le stock de ce produit
            const stock = parseInt(JSON.stringify(response.body.availableStock));
            cy.log(`stock produit n°${ID_PRODUIT_DISPO} : ${stock})`);
        })
    })

    it('API-007b - Tente de récupérer les informations d’un produit inexistant', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/products/999999',
            failOnStatusCode: false // Par défaut, cy.request() considère un code HTTP 4xx ou 5xx comme un échec de commande. L'option failOnStatusCode: false permet de vérifier volontairement ces réponses
        }).then((response) => {
            expect(response.status).to.eq(404);
        })
    })

    
    it("API-008a - Ajoute un produit disponible en stock au panier", () => {
        loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_DISPO,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });

    it("API-008b - Refuse d'ajouter un produit en rupture de stock au panier", () => {
        loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_EN_RUPTURE,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(409); // code d'erreur à définir
            });
        });
    });

    it("API-009a - Liste les produits du panier dans le cas d'un utilisateur connecté", () => {
        loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_DISPO,
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

                    cy.log(JSON.stringify(response.body.orderLines, null, 2)) // replacer : fonction qui modifie les valeurs
                })
            })
        })
    });

    it("API-009b - Liste les produits du panier dans le cas d'un utilisateur non connecté", () => {
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
    
    it("API-010a - Change la quantité de produits d’une ligne présente dans le panier", () => {
        loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_DISPO,
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

    it("API-010b - Essaie de changer la quantité de produits d’une ligne absente du panier", () => {
        loginApi().then( (token) => {
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
    
    it("API-011 - Supprime un produit du panier", () => {
        loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_DISPO,
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

    it("API-012a - Valide la commande pour le panier en cours, dans le cas où tous les produits sont disponibles", () => {
        loginApi().then( (token) => {
            
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_DISPO,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);

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
        })
    });

    it("API-012b - Refuse de valider la commande pour le panier en cours, dans le cas où un produit n’est pas disponible", () => {
        loginApi().then( (token) => {
            
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: ID_PRODUIT_EN_RUPTURE,
                        quantity: 2
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);

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
                    expect(response.status).to.eq(400); // code à définir
                })
            })
        })
    });

    it('API-013 - Récupère les avis postés sur le site', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8081/reviews'
        }).then((response) => {
            expect(response.status).to.eq(200);
        })
    })

    it('API-014 - Crée un nouvel avis', () => {
        loginApi().then( (token) => {
            cy.request(
                {
                    method: 'POST',
                    url: 'http://localhost:8081/reviews',
                    auth: { bearer: token },
                    body: {
                        title: `Cypress-API-${Date.now()}`,
                        comment: "Commentaire test",
                        rating: 5
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200);
            })
        })
    });
});


