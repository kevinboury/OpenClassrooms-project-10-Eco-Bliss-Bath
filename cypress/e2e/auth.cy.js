import {
    selector, 
    openLogin, 
    openRegister, 
    assertVisibleError, 
    fillRegistration, 
    fillLogin, 
    loginUI } from '../support/tools';

describe('Scénario 1 — Authentification', () => {
    it('AUTH-001 — Refuse l’inscription (champs vides)', () => {
        openRegister();
        cy.get(selector.register.submit).click();
        assertVisibleError(selector.register.error);
        cy.get(selector.nav.logout).should('not.exist');
    });

    it('AUTH-002 — Refuse l’inscription (email invalide)', () => {
        openRegister();
        fillRegistration({
            firstname: 'Prénom',
            lastname: 'Nom',
            email: 'email-invalide',
            password: 'mdp-cypress',
        });
        cy.get(selector.register.submit).click();
        assertVisibleError(selector.register.error);
        cy.get(selector.nav.logout).should('not.exist');
    });

    it('AUTH-003 — Inscrit l’utilisateur et actualise l’interface', () => {
        // Pas d'API de suppression des comptes : email unique.
        const email = `cypress-auth-${Date.now()}@test.fr`;

        cy.intercept('POST', '**/register').as('register');
        openRegister();
        fillRegistration({
            firstname: 'Prénom',
            lastname: 'Nom',
            email: email,
            password: 'mdp-cypress',
        });
        cy.get(selector.register.submit).click();

        cy.wait('@register').its('response.statusCode').should('eq', 200);
        cy.location('hash').should('eq', '#/'); // route après redirection
        cy.get(selector.nav.login).should('not.exist');
        cy.get(selector.nav.cart).should('be.visible');
    });

    it('AUTH-004 — Refuse la connexion (champs vides)', () => {
        openLogin();
        cy.get(selector.login.submit).click();
        assertVisibleError(selector.login.error);
        cy.get(selector.nav.logout).should('not.exist');
    });

    it('AUTH-005 — Refuse la connexion (email invalide)', () => {
        openLogin();
        fillLogin({
            email: 'email-invalide',
            password: 'mdp-cypress',
        })
        cy.get(selector.login.submit).click();
        assertVisibleError(selector.login.error);
        cy.get(selector.nav.logout).should('not.exist');
    });

    it('AUTH-006 — Refuse la connexion (mot de passe incorrect)', () => {
        cy.intercept('POST', '**/login').as('loginInvalide');
        openLogin();

        cy.env(['testEmail']).then(({ testEmail }) => {
            fillLogin({
                email: testEmail,
                password: 'mauvais-mdp',
            })
            cy.get(selector.login.submit).click();
        });

        cy.wait('@loginInvalide').its('response.statusCode').should('eq', 401);
        assertVisibleError(selector.login.error);
        cy.get(selector.nav.logout).should('not.exist');
    });

    it('AUTH-007 — Connecte l’utilisateur et actualise l’interface', () => {
        loginUI();
        cy.location('hash').should('eq', '#/'); // route après redirection
        cy.get(selector.nav.login).should('not.exist');
        cy.get(selector.nav.cart).should('be.visible');
    });

    it('AUTH-008 — Déconnecte l’utilisateur et actualise l’interface', () => {
        loginUI();
        cy.get(selector.nav.logout).click();
        cy.get(selector.nav.login).should('be.visible');
        cy.get(selector.nav.logout).should('not.exist');
        cy.get(selector.nav.cart).should('not.exist');
    });
});
