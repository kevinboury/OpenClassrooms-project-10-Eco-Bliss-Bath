import { URL_API, loginApi, loginUI, selector } from '../support/tools'

const do_screenshots = false;

const products = Cypress.expose('products');
const ID_PRODUIT_EN_RUPTURE = products.productC_Rupture.id;

describe('Test XSS - EcoBlissBath', () => {
    

    beforeEach(() => {

        cy.session('utilisateur-test', () => {
            loginUI()
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
        cy.get(selector.reviewInput.title).type(injection_title, { parseSpecialCharSequences: false });
        cy.get(selector.reviewInput.comment).type(injection_comment, { parseSpecialCharSequences: false });

        // Sélectionne la 3ème étoile pour l'avis
        cy.get(selector.reviewInput.ratingImages + ' img').eq(2).click();
        cy.get(selector.reviewInput.rating).should('have.value', '3');

        cy.get(selector.reviewInput.submit).click();



        // cy.get('[data-cy="review-title"]').contains(injection_title);
        cy.contains(selector.review.title, "test - "+injection_title)
            .closest(selector.review.detail)
            .find(selector.review.comment)
            .should("be.empty");
        // cy.get(selector.review.comment).should("be.empty"); // le champ commentaire est vide
        // cy.get(selector.review.comment).should('contain.text', injection_comment); // l'injection est affichée "assainie"
        
        do_screenshots && cy.screenshot(`XSS-001-Avis-${Date.now()}`);
    });
    
    it('XSS-002a - neutralise une injection XSS dans la requête API d\'ajout au panier - product ID', () => {
        const injection = '<img src=x onerror=alert("XSS Attack!")>';

        loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: `${URL_API}/orders/add`,
                    auth: { bearer: token },
                    body: {
                        product: injection,
                        quantity: 1
                    },
                    failOnStatusCode: false
                }
            ).then((response) => {
                expect(response.status).to.eq(400); // log cypress : {"error":{"product":["This value is not valid."]}}
            });
        })
        
    });

    it('XSS-002b - neutralise une injection XSS dans la requête API d\'ajout au panier - product quantity', () => {
        const injection = '<img src=x onerror=alert("XSS Attack!")>';

        loginApi().then( (token) => {
            cy.request(
                {
                    method: 'PUT',
                    url: `${URL_API}/orders/add`,
                    auth: { bearer: token },
                    body: {
                        product: 3,
                        quantity: injection
                    },
                    failOnStatusCode: false
                }
            ).then((response) => {
                expect(response.status).to.eq(400); // log cypress : {"error":{"product":["This value is not valid."]}}
            });
        })
        
    });

    it('XSS-003 - neutralise une injection XSS dans la requête API de validation du panier', () => {
        const injection_img = '<img src=x onerror=alert("XSS Attack!")>';
        const injection_script = "<script>alert('XSS Attack!');</script>";

        loginApi().then( (token) => {
            //ajout du produit
            cy.request(
                {
                    method: 'PUT',
                    url: `${URL_API}/orders/add`,
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
                        url: `${URL_API}/orders`,
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

});
