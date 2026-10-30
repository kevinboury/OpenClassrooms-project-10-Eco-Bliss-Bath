const { defineConfig } = require("cypress");

module.exports = defineConfig(
    {
        e2e: {
            baseUrl: "http://localhost:4200",
            setupNodeEvents(on, config) {
                // implement node event listeners here
            },
        },
        
        viewportHeight: 1200,
        viewportWidth: 1200, 
    }
);
