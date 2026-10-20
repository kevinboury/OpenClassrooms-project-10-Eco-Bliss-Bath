
describe('Smoke tests - EcoBlissBath', () => {

    it('SMK-001 - Affiche la page d\'accueil', () => {

        // 1. Accéder à la boutique
        cy.visit('/');

        // 2. Vérifier que le contenu de la page est visible
        cy.get('body').should('be.visible');

        // 3. Vérifier que la page contient un titre
        cy.get('h1').should('be.visible');

        // cy.get('#element-qui-nexiste-pas').should('be.visible');

        cy.screenshot('SMK-001-accueil');
    });
});
