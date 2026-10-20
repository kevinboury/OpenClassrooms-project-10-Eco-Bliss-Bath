
describe('Tests API - EcoBlissBath', () => {

    it('API-001 - Récupère le catalogue des produits', () => {

        cy.request('GET', 'http://localhost:8081/products').then((response) => {

            // Vérifier le code HTTP
            expect(response.status).to.eq(200);

            // Vérifier que la réponse est un tableau
            expect(response.body).to.be.an('array');

            // Vérifier que le tableau n'est pas vide
            expect(response.body.length).to.be.greaterThan(0);

            }
        );

    });
    
    //Par défaut, cy.request() considère un code HTTP 4xx ou 5xx comme un échec de commande. L'option failOnStatusCode: false permet de vérifier volontairement ces réponses
    it('API-003 - Consulter un produit inexistant', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8080/api/products/999999',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        })
    })

});

// API-001	Récupérer les produits	HTTP 200, liste valide
// API-002	Consulter un produit existant	HTTP 200, données correctes
// API-003	Consulter un produit inexistant	HTTP 404
// API-004	Se connecter avec des identifiants valides	Authentification réussie
// API-005	Se connecter avec un mot de passe incorrect	HTTP 401, si prévu par l'API
// API-006	Accéder à une ressource protégée sans authentification	Accès refusé
// API-007	Ajouter un produit au panier	Panier correctement mis à jour

