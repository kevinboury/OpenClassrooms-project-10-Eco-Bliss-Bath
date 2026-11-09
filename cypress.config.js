const { defineConfig } = require("cypress");
const testEnv = require("./cypress.env.json");

module.exports = defineConfig(
    {
        e2e: {
            baseUrl: testEnv.urlFrontend,
            setupNodeEvents(on, config) {
                // implement node event listeners here
            },
        },
        
        expose: {
            urlAPI: testEnv.urlAPI,
            products: testEnv.products,
        },

        viewportHeight: 1200,
        viewportWidth: 1200, 
    }
);
