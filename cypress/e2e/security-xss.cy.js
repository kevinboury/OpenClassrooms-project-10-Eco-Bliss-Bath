
describe('Test XSS - EcoBlissBath', () => {
    
    const do_screenshots = false;

    beforeEach(() => {
        cy.session('utilisateur-test', () => {
            cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
                cy.visit('/#/login');
                cy.get('[data-cy="login-input-username"]').type(testEmail)  
                cy.get('[data-cy="login-input-password"]').type(testPassword, { log: false })  
                
                // ici on attend explicitement la réponse HTTP avant de continuer
                cy.intercept('POST', '**/login').as('login');
                cy.get('[data-cy="login-submit"]').click();
                cy.wait('@login').then(({ response }) => {
                    expect(response.statusCode).to.eq(200);
                });
            });
        });
    });

    it('XSS-001 - neutralise une injection XSS dans le champ commentaire', () => {
        const injection_title = `Cypress-${Date.now()}`;
        const injection_comment = "<script>alert('XSS Attack!');</script>";

        cy.visit('/#/reviews');

        // Surveille les fenêtres alert()
        cy.on('window:alert', (message) => {
            throw new Error(`Alerte inattendue : ${message}`);
        });

        // L'option parseSpecialCharSequences: false permet de saisir littéralement le texte contenant des caractères spéciaux, sans que Cypress les interprète comme des séquences de touches.
        cy.get('[data-cy="review-input-title"]').type(injection_title, { parseSpecialCharSequences: false });
        cy.get('[data-cy="review-input-comment"]').type(injection_comment, { parseSpecialCharSequences: false });

        // Sélectionne la 3ème étoile pour l'avis
        cy.get('[data-cy="review-input-rating-images"] img').eq(2).click();
        cy.get('[data-cy="review-input-rating"]').should('have.value', '3');

        cy.get('[data-cy="review-submit"]').click();



        // cy.get('[data-cy="review-title"]').contains(injection_title);
        cy.contains('[data-cy="review-title"]', "test - "+injection_title)
            .closest('[data-cy="review-detail"]')
            .find('[data-cy="review-comment"]')
            .should("be.empty");
        // cy.get('[data-cy="review-comment"]').should("be.empty"); // le champ commentaire est vide
        // cy.get('[data-cy="review-comment"]').should('contain.text', injection_comment); // l'injection est affichée "assainie"
        
        do_screenshots && cy.screenshot(`XSS-001-Avis-${Date.now()}`);
    });
    
    it('XSS-002a - neutralise une injection XSS dans la requête API d\'ajout au panier', () => {
        const injection = '<img src=x onerror=alert("XSS Attack!")>';

        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: injection,
                        quantity: 1
                    },
                    failOnStatusCode: false
                }
            ).then((response) => {
                // cy.log(`Statut HTTP : ${response.status}`);
                // cy.log(JSON.stringify(response.body));
                expect(response.status).to.eq(400); // log cypress : {"error":{"product":["This value is not valid."]}}
            });
        })
        
    });

    it('XSS-002b - neutralise une injection XSS dans la requête API d\'ajout au panier', () => {
        const injection = '<img src=x onerror=alert("XSS Attack!")>';

        cy.loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: 3,
                        quantity: injection
                    },
                    failOnStatusCode: false
                }
            ).then((response) => {
                // cy.log(`Statut HTTP : ${response.status}`);
                // cy.log(JSON.stringify(response.body));
                expect(response.status).to.eq(400); // log cypress : {"error":{"product":["This value is not valid."]}}
            });
        })
        
    });

    it('XSS-003 - neutralise une injection XSS dans la requête API de validation du panier', () => {
        const injection_img = '<img src=x onerror=alert("XSS Attack!")>';
        const injection_script = "<script>alert('XSS Attack!');</script>";

        cy.loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: 'http://localhost:8081/orders/add',
                    auth: { bearer: token },
                    body: {
                        product: 3,
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
                            "firstname": injection_img,
                            "lastname": injection_script,
                            "address": "Adresse",
                            "zipCode": "33333",
                            "city": "Ville"
                        },
                        failOnStatusCode: false
                    }
                ).then((response) => {
                    cy.log(`Statut HTTP : ${response.status}`);
                    cy.log(JSON.stringify(response.body));
                    // expect(response.status).to.eq(400); // code à définir
                })
            })
        })
    })
    // // Vérifier que l'injection ne crée pas d'image HTML dans le conteneur où s'affiche le contenu.
    // cy.get('[data-cy="review-comment"]').find('img[onerror]').should('not.exist');

});
