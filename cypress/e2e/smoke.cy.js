import { 
    selector, 
    openLogin, 
    openRegister, 
    assertVisibleError, 
    fillRegistration, 
    fillLogin, 
    loginUI } from '../support/tools';

    //TODO

const id_produit_a_tester = 5;
const do_screenshots = false;

describe('Smoke tests - EcoBlissBath', () => {


    it("SMK-001 - Accueil - Affiche la page d'accueil", () => {

        cy.visit('/');
        cy.get('body').should('be.visible');
        cy.get('h1').should('be.visible');

        do_screenshots && cy.screenshot(`SMK-001-Accueil-${Date.now()}`);
    });

    it("SMK-002 - Accueil - Affiche le header avec les boutons Accueil, Produits, Avis, Connexion, Inscription", () => {

        cy.visit('/');
        cy.get('header').should('be.visible');
        cy.contains('Accueil').should('be.visible');
        cy.contains('Produits').should('be.visible');
        cy.contains('Avis').should('be.visible');
        cy.contains('Connexion').should('be.visible');
        cy.contains('Inscription').should('be.visible');

        do_screenshots && cy.screenshot(`SMK-002-Accueil-${Date.now()}`);
    });


    it("SMK-003 - Produits - Affiche la liste des produits et teste la présence d'au moins un produit", () => {

        cy.visit('/#/products');
        cy.get('.list-products').should('be.visible'); // absence de sélecteur pour Cypress actuellement
        cy.get(selector.products.product).should('be.visible');
        cy.get(selector.products.picture).should('be.visible');
        cy.get(selector.products.name).should('be.visible');
        cy.get(selector.products.ingredients).should('be.visible');

        do_screenshots && cy.screenshot(`SMK-003-Produits-${Date.now()}`);
    });

    it("SMK-004 - Produits - Affiche le bouton Consulter pour chaque produit de la liste", () => {

        cy.visit('/#/products');
        cy.get(selector.products.product).each( () => {
            cy.contains('button', 'Consulter').should('be.visible');
        })

        do_screenshots && cy.screenshot(`SMK-004-Produits-${Date.now()}`);
    });


    it("SMK-005 - Fiche produit - Affiche les informations du produit (titre, image, prix, description et quantité disponible)", () => {

        cy.visit('/#/products/'+id_produit_a_tester);

        cy.get(selector.product.image).should('be.visible');
        cy.get(selector.product.name).should('be.visible');
        cy.get(selector.product.description).should('be.visible');
        cy.get(selector.product.price).should('be.visible');
        cy.get(selector.product.stock).should('be.visible');        

        do_screenshots && cy.screenshot(`SMK-005-Fiche_produit-${Date.now()}`);
    });

    it("SMK-006 - Fiche produit - Affiche l’input de sélection de quantité et le bouton Ajouter au panier", () => {

        cy.visit('/#/products/'+id_produit_a_tester);
        cy.get(selector.product.quantity).should('be.visible');
        cy.get(selector.product.add).should('be.visible');
        
        do_screenshots && cy.screenshot(`SMK-006-Fiche_produit-${Date.now()}`);
    });


    it("SMK-007 - Avis - Affiche la page Avis et au moins un avis", () => {

        cy.visit('/#/reviews');
        cy.get('h1').contains("Votre avis");
        cy.get(selector.review.detail).should('be.visible');

        do_screenshots && cy.screenshot(`SMK-007-Avis-${Date.now()}`);
    });


    it("SMK-008 - Connexion - Affiche le formulaire de connexion et tous ses champs", () => {

        cy.visit('/#/login');
        cy.get(selector.login.form).should('be.visible');  
        cy.get(selector.login.email).should('be.visible');  
        cy.get(selector.login.password).should('be.visible');  
        cy.get(selector.login.submit).should('be.visible');  

        do_screenshots && cy.screenshot(`SMK-008-Connexion-${Date.now()}`);
    });


    it("SMK-009 - Inscription - Affiche le formulaire d'inscription et tous ses champs", () => {

        cy.visit('/#/register');
        cy.get(selector.register.lastname).should('be.visible');
        cy.get(selector.register.firstname).should('be.visible');
        cy.get(selector.register.email).should('be.visible');
        cy.get(selector.register.password).should('be.visible');
        cy.get(selector.register.confirm).should('be.visible');
        cy.get(selector.register.submit).should('be.visible');

        do_screenshots && cy.screenshot(`SMK-010-Inscription-${Date.now()}`);
    });

    
    it("SMK-010 - Accueil (connecté) - Affiche les boutons Mon panier, Déconnexion", () => {

        loginUI()

        cy.get('header').should('be.visible');
        cy.contains('Mon panier').should('be.visible');
        cy.contains('Déconnexion').should('be.visible');

        do_screenshots && cy.screenshot(`SMK-012-Accueil_connecte-${Date.now()}`);
    });

    it("SMK-011 - Avis (connecté) - Affiche le formulaire d'avis et tous ses champs", () => {
        loginUI()

        cy.visit('/#/reviews');
        // cy.get('[data-cy="nav-link-reviews"]').click()

        cy.get(selector.reviewInput.form).should('be.visible');
        cy.get(selector.reviewInput.ratingImages).should('be.visible'); // visuel de la note (étoiles)
        cy.get(selector.reviewInput.title).should('be.visible');
        cy.get(selector.reviewInput.comment).should('be.visible');
        cy.get(selector.reviewInput.submit).should('be.visible');

        do_screenshots && cy.screenshot(`SMK-013-Avis_connecte-${Date.now()}`);
    });

    it("SMK-012 - Panier vide (connecté) - Indique que le panier est vide", () => {
        loginUI()

        cy.visit('/#/cart');
        // cy.get('[data-cy="nav-link-cart"]').click()
        cy.get(selector.cart.empty).should('be.visible');
        
        do_screenshots && cy.screenshot(`SMK-014-Panier_vide_connecte-${Date.now()}`);
    });

    it("SMK-013 - Panier non vide (connecté) - Affiche le panier avec au moins un produit et le formulaire de commande", () => {

        loginUI()

        // TODO ajout de produit
        cy.intercept('GET', '**/products/5').as('productLoaded');
        cy.intercept('PUT', '**/orders/add').as('productAdded');

        cy.visit('/#/products/'+id_produit_a_tester);
        cy.wait('@productLoaded').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
        });

        cy.get(selector.product.add).click();
        cy.wait('@productAdded').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
        });

        // redirection automatique
        // cy.visit('/#/cart');
        cy.get(selector.cart.line).should('be.visible');

        cy.get(selector.cartInput.lastname).should('be.visible');
        cy.get(selector.cartInput.firstname).should('be.visible');
        cy.get(selector.cartInput.address).should('be.visible');
        cy.get(selector.cartInput.zipCode).should('be.visible');
        cy.get(selector.cartInput.city).should('be.visible');
        cy.get(selector.cartInput.submit).should('be.visible');
    
        do_screenshots && cy.screenshot(`SMK-015-Panier_non_vide_connecte-${Date.now()}`);
    });
});
