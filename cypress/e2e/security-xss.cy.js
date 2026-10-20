
describe('SEC-001 - Test XSS général', () => {

    beforeEach(() => {
        cy.session('utilisateur-test', () => {

            cy.visit('/#/login');

            cy.env(["testEmail", "testPassword"]).then( ({ testEmail, testPassword }) => {
                cy.get('[data-cy="email"]').type(testEmail);
                cy.get('[data-cy="password"]').type(cy.env(testPassword), { log: false }); // log false ???
            });

            cy.get('[data-cy="login-submit"]').click();

            // Vérifier que la connexion a réussi
            // cy.contains('Déconnexion').should('be.visible');
            cy.get('[data-cy="nav-link-logout"]').should('be.visible');

        });
    });

    it('XSS-001 - neutralise une injection HTML dans le champ commentaire', () => {
        const injection = "<script>alert('XSS Attack!');</script>";

        cy.visit('/#/reviews');

        // Surveiller les fenêtres alert()
        cy.on('window:alert', (message) => {
            throw new Error(`Alerte inattendue : ${message}`);
        });

        // L'option parseSpecialCharSequences: false permet de saisir littéralement le texte contenant des caractères spéciaux, sans que Cypress les interprète comme des séquences de touches.
        cy.get('#title').type("Cypress-test", {
            parseSpecialCharSequences: false
        });
        cy.get('#comment').type(injection, {
            parseSpecialCharSequences: false
        });

        
        cy.contains('button', 'Publier').click();

        // // Vérifier que l'injection ne crée pas d'image HTML dans le conteneur où s'affiche le contenu.
        // cy.get('[data-cy="review-comment"]').find('img[onerror]').should('not.exist');

    });

});
