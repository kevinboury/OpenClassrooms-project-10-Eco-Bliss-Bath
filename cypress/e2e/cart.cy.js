import { 
    URL_API,
    selector, 
    eurosToCents,
    openCart,
    fillCheckout,
    loginApi, 
    loginUI, 
    trySubmit, 
    addProductFromUI } from '../support/tools';

const PRODUCT_A = 5; 
const PRODUCT_B = 8;


// Préparation via API, hors parcours fonctionnel évalué.
// Ces appels effacent uniquement le panier du compte de test authentifié.
function clearTestCart() {
    return loginApi().then( (token) => {
        return cy.request(
            {
                method: 'GET',
                url: `${URL_API}/orders`,
                auth: { bearer: token },
                failOnStatusCode: false
            }
            ).then((response) => {

            // Aucun panier existant
            if (response.status === 404) {
                cy.log('Aucun panier à vider');
                return;
            }

            expect(response.status).to.eq(200);

            const lines = response.body?.orderLines ?? [];

            // Panier existant mais vide
            if (lines.length === 0) {
                cy.log('Le panier est déjà vide');
                return;
            }

            // Suppression des lignes du panier
            return cy.wrap(lines).each((line) => {
                cy.request(
                        {
                        method: 'DELETE',
                        url: `${URL_API}/orders/${line.id}/delete`,
                        auth: { bearer: token }
                    }
                );
            }).then(() => {

                // Vérification finale
                cy.request(
                    {
                        method: 'GET',
                        url: `${URL_API}/orders`,
                        auth: { bearer: token }
                    }
                ).its('body.orderLines').should('have.length', 0);

            });
        });
    });
}

// Prépare une commande non vide pour CART-002/003/004, sans refaire le parcours UI.
function seedCart() {
    return loginApi().then((token) => {
        return cy.request(
            {
                method: 'PUT',
                url: `${URL_API}/orders/add`,
                auth: { bearer: token },
                body: { 
                    product: PRODUCT_A, 
                    quantity: 1 
                },
            }
        ).its('status').should('eq', 200);
    });
}


// Renvoie une chaîne Cypress représentant la ligne du produit demandé.
function lineFor(name) {
    return cy.contains(selector.cart.name, name).closest(selector.cart.line);
}

function assertMoney(selector, expectedCents) {
    cy.get(selector).invoke('text').then((text) => {
        expect(eurosToCents(text), `Montant affiché par ${selector}`).to.eq(expectedCents);
    });
}

function assertLine(product, quantity) {
    lineFor(product.name).within(() => {
        cy.get(selector.cart.name).should('have.text', product.name);
        cy.get(selector.cart.quantity).should('have.value', String(quantity));
        assertMoney(selector.cart.lineTotal, product.priceCents * quantity);
    });
}

function assertTotal(expectedCents) {
    assertMoney(selector.cart.total, expectedCents);
}





function prepareCheckout() {
    seedCart();
    openCart();
    cy.get(selector.cartInput.submit).should('be.visible');
}

describe('Scénario 2 — Panier', () => {
    beforeEach(() => {
        loginUI(); // E2E : connexion dans le navigateur
        clearTestCart(); // API : panier vide et état connu
    });

    it('CART-001 — Constitue puis modifie un panier avec deux produits', () => {
        // On récupère les données produit APRÈS leur lecture par Cypress.
        // Éviter les variables utilisées hors de .then() : les commandes sont asynchrones.


        addProductFromUI(PRODUCT_A, 2).then((productA) => {
            openCart();
            assertLine(productA, 2);
            assertTotal(productA.priceCents * 2);

            addProductFromUI(PRODUCT_B, 1).then((productB) => {
                openCart();
                assertLine(productA, 2);
                assertLine(productB, 1);
                assertTotal(productA.priceCents * 2 + productB.priceCents);

                // Modification de la quantité du produit A (2 -> 3).
                cy.intercept('PUT', '**/orders/*/change-quantity').as('quantityChanged');
                lineFor(productA.name).find(selector.cart.quantity).type('{selectall}3').blur(); // clear() ne fonctionne pas
                cy.wait('@quantityChanged').then(({ response }) => {
                    expect(response.statusCode).to.eq(200);
                });

                assertLine(productA, 3);
                assertLine(productB, 1);
                assertTotal(productA.priceCents * 3 + productB.priceCents);

                // Suppression du produit A : le produit B doit rester.
                cy.intercept('DELETE', '**/orders/*/delete').as('lineDeleted');
                lineFor(productA.name).find(selector.cart.delete).click();
                cy.wait('@lineDeleted').then(({ response }) => {
                    expect(response.statusCode).to.eq(200);
                });

                cy.contains(selector.cart.name, productA.name).should('not.exist');
                assertLine(productB, 1);
                assertTotal(productB.priceCents);
            });
        });
    });

    it('CART-002 — Refuse la validation (champs vides)', () => {
        prepareCheckout();
        trySubmit(selector.cartInput.submit);

        // il n'y a pas de message d'errer pour le panier
        // les labels deviennent simplement rouges (ils prennent la class .error)

        // Vérification du signalement de l'erreur
        cy.get('label[for="zipCode"]').should('have.class', 'error');

        // Vérifier l'absence de redirection
        cy.location('hash').should('not.eq', '#/confirmation');
    });

    it('CART-003 — Refuse la validation (données invalides)', () => {
        prepareCheckout();
        cy.env( ["cartInput_Invalid"] ).then( ({cartInput_Invalid}) => {
            fillCheckout(cartInput_Invalid);

            // tryCheckout();
            trySubmit(selector.cartInput.submit);

            // il n'y a pas de message d'errer pour le panier
            // les labels deviennent simplement rouges (ils prennent la class .error)

            // Vérification du signalement de l'erreur
            cy.get('label[for="zipCode"]').should('have.class', 'error');

            // Vérifier l'absence de redirection
            cy.location('hash').should('not.eq', '#/confirmation');
        } )
    });

    it('CART-004 — Accepte la validation (données valides)', () => {
        
        prepareCheckout();
        cy.env( ["cartInput_Valid"] ).then( ({cartInput_Valid}) => {
            fillCheckout(cartInput_Valid);

            cy.intercept('POST', '**/orders').as('orderValidated');
            cy.get(selector.cartInput.submit).click();
            
            // Acceptation du backend
            cy.wait('@orderValidated').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            // Vérification de la redirection
            cy.location('hash').should('eq', '#/confirmation');

            // Vérification du message de confirmation
            cy.get('#confirmation .subtitle-confirm').should('be.visible').and('have.text', 'Votre commande est bien validée');
        })
    });
});
