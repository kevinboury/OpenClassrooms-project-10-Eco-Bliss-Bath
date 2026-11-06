const { defineConfig } = require("cypress");

module.exports = defineConfig(
    {

        /* 
            Depuis Cypress 16, la documentation recommande de distinguer :
            - Cypress.expose() pour les paramètres publics (URL d'API, options de configuration).
            - cy.env() pour les données sensibles (identifiants, mots de passe, tokens).

            Qaunt à baseUrl, c'est une propriété native de Cypress. 
            Elle lui indique l'adresse de référence pour les commandes de navigation
        */

        e2e: {
            baseUrl: "http://localhost:4200",
            setupNodeEvents(on, config) {
                // implement node event listeners here
            },
        },
        
        expose: {
            apiUrl: "http://localhost:8081",
        },

        viewportHeight: 1200,
        viewportWidth: 1200, 
    }
);
