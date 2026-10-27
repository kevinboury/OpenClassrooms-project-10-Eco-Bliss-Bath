
describe('Smoke tests - EcoBlissBath', () => {

    const id_produit_a_tester = 5;

    it("SMK-001 - Accueil - Affiche la page d'accueil", () => {

        cy.visit('/');
        cy.get('body').should('be.visible');
        cy.get('h1').should('be.visible');

        // cy.screenshot('SMK-001-accueil');
    });
    it("SMK-002 - Accueil - Affiche le header avec les boutons Accueil, Produits, Avis, Connexion, Inscription", () => {

        cy.visit('/');
        cy.get('header').should('be.visible');
        cy.contains('Accueil').should('be.visible');
        cy.contains('Produits').should('be.visible');
        cy.contains('Avis').should('be.visible');
        cy.contains('Connexion').should('be.visible');
        cy.contains('Inscription').should('be.visible');

        // cy.screenshot('SMK-001-accueil');
    });


    it("SMK-003 - Produits - Affiche la liste des produits et teste la présence d'au moins un produit", () => {

        cy.visit('/#/products');
        cy.get('.list-products').should('be.visible');
        cy.get('[data-cy="product"]').should('be.visible');

        // cy.screenshot('SMK-001-accueil');
    });
    it("SMK-004 - Produits - Affiche le bouton Consulter pour chaque produit de la liste", () => {

        cy.visit('/#/products');
        cy.get('[data-cy="product"]').each( () => {
            cy.contains('button', 'Consulter').should('be.visible');
        })

        // cy.screenshot('SMK-001-accueil');
    });

    it("SMK-005 - Fiche produit - Affiche les informations du produit (titre, image, prix, description et quantité disponible", () => {

        cy.visit('/#/products/'+id_produit_a_tester);

        cy.get('[data-cy="detail-product-img"]').should('be.visible');
        cy.get('[data-cy="detail-product-name"]').should('be.visible');
        cy.get('[data-cy="detail-product-description"]').should('be.visible');
        cy.get('[data-cy="detail-product-price"]').should('be.visible');
        cy.get('[data-cy="detail-product-stock"]').should('be.visible');        

        // cy.screenshot('SMK-001-accueil');
    });

    it("SMK-006 - Fiche produit - Affiche l’input de sélection de quantité et le bouton Ajouter au panier", () => {

        cy.visit('/#/products/'+id_produit_a_tester);
        cy.get('[data-cy="detail-product-quantity"]').should('be.visible');
        cy.get('[data-cy="detail-product-add"]').should('be.visible');
        
        // cy.screenshot('SMK-001-accueil');
    });

    it("SMK-007 - Avis - Affiche la page Avis et au moins un avis", () => {

        cy.visit('/#/reviews');
        cy.get('.review-section').should('be.visible');
        cy.get('[data-cy="review-detail"]').should('be.visible');

        // cy.screenshot('SMK-001-accueil');
    });

    it("SMK-008 - Connexion - Affiche le formulaire de connexion et tous ses champs", () => {

        cy.visit('/#/login');
        cy.get('[data-cy="login-form"]').should('be.visible');  
        cy.get('[data-cy="login-input-username"]').should('be.visible');  
        cy.get('[data-cy="login-input-password"]').should('be.visible');  
        cy.get('[data-cy="login-submit"]').should('be.visible');  

        // cy.screenshot('SMK-001-accueil');
    });

    it("SMK-009 - ", () => {

    });

    it("SMK-010 - Inscription - Affiche le formulaire d'inscription et tous ses champs", () => {

        cy.visit('/#/register');
        cy.get('[data-cy="register-input-lastname"]').should('be.visible');
        cy.get('[data-cy="register-input-firstname"]').should('be.visible');
        cy.get('[data-cy="register-input-email"]').should('be.visible');
        cy.get('[data-cy="register-input-password"]').should('be.visible');
        cy.get('[data-cy="register-input-password-confirm"]').should('be.visible');
        cy.get('[data-cy="register-submit"]').should('be.visible');

        // cy.screenshot('SMK-001-accueil');
    });

    it("SMK-011 - ", () => {

    });

    it("SMK-012 - Accueil (connecté) - Affiche les boutons Mon panier, Déconnexion", () => {

        cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
            cy.visit('/#/login');
            cy.get('[data-cy="login-input-username"]').type(testEmail)  
            cy.get('[data-cy="login-input-password"]').type(testPassword)  
            
            // ici on attend explicitement la réponse HTTP avant de continuer
            cy.intercept('POST', '**/login').as('login');
            cy.get('[data-cy="login-submit"]').click();
            cy.wait('@login').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            cy.get('header').should('be.visible');
            cy.contains('Mon panier').should('be.visible');
            cy.contains('Déconnexion').should('be.visible');

            // cy.screenshot('SMK-001-accueil');
        });
    });

    it("SMK-013 - Avis (connecté) - Affiche le formulaire d'avis et tous ses champs", () => {

        cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
            cy.visit('/#/login');

            cy.get('[data-cy="login-input-username"]').type(testEmail)  
            cy.get('[data-cy="login-input-password"]').type(testPassword)  

            // ici on attend explicitement la réponse HTTP avant de continuer
            cy.intercept('POST', '**/login').as('login');
            cy.get('[data-cy="login-submit"]').click();
            cy.wait('@login').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            cy.visit('/#/reviews');
            // cy.get('[data-cy="nav-link-reviews"]').click()

            cy.get('[data-cy="review-form"]').should('be.visible');
            cy.get('[data-cy="review-input-rating-images"]').should('be.visible'); //note de l'avis (étoiles)
            cy.get('[data-cy="review-input-title"]').should('be.visible');
            cy.get('[data-cy="review-input-comment"]').should('be.visible');
            cy.get('[data-cy="review-submit"]').should('be.visible');

            // cy.screenshot('SMK-001-accueil');
        });
    });

    it("SMK-014 - Panier vide (connecté) - Indique que le panier est vide", () => {

        cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
            cy.visit('/#/login');

            cy.get('[data-cy="login-input-username"]').type(testEmail)  
            cy.get('[data-cy="login-input-password"]').type(testPassword)  

            // ici on attend explicitement la réponse HTTP avant de continuer
            cy.intercept('POST', '**/login').as('login');
            cy.get('[data-cy="login-submit"]').click();
            cy.wait('@login').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            cy.visit('/#/cart');
            // cy.get('[data-cy="nav-link-cart"]').click()
            cy.get('[data-cy="cart-empty"]').should('be.visible');
        })

        // cy.screenshot('SMK-001-accueil');
    });
    it("SMK-015 - Panier non vide (connecté) - Affiche le panier avec au moins un produit et le formulaire de commande", () => {

        cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
            cy.visit('/#/login');

            cy.get('[data-cy="login-input-username"]').type(testEmail)  
            cy.get('[data-cy="login-input-password"]').type(testPassword)  

            // ici on attend explicitement la réponse HTTP avant de continuer
            cy.intercept('POST', '**/login').as('login');
            cy.get('[data-cy="login-submit"]').click();
            cy.wait('@login').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            // 
            cy.intercept('GET', '**/products/5').as('produit');
            cy.intercept('PUT', '**/orders/add').as('ajout');

            cy.visit('/#/products/'+id_produit_a_tester);
            cy.wait('@produit').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            cy.get('[data-cy="detail-product-add"]').click();
            cy.wait('@ajout').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
            });

            // redirection automatique
            // cy.visit('/#/cart');
            cy.get('[data-cy="cart-line"]').should('be.visible');

            cy.get('[data-cy="cart-input-lastname"]').should('be.visible');
            cy.get('[data-cy="cart-input-firstname"]').should('be.visible');
            cy.get('[data-cy="cart-input-address"]').should('be.visible');
            cy.get('[data-cy="cart-input-zipcode"]').should('be.visible');
            cy.get('[data-cy="cart-input-city"]').should('be.visible');
            cy.get('[data-cy="cart-submit"]').should('be.visible');
        
        })
    });
});
