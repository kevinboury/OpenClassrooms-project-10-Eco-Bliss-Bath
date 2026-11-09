export const URL_API = Cypress.expose('urlAPI');

export const selector = {
    nav: {
        login: '[data-cy="nav-link-login"]',
        register: '[data-cy="nav-link-register"]',
        logout: '[data-cy="nav-link-logout"]',
        cart: '[data-cy="nav-link-cart"]',
    },
    login: {
        form: '[data-cy="login-form"]',
        email: '[data-cy="login-input-username"]',
        password: '[data-cy="login-input-password"]',
        submit: '[data-cy="login-submit"]',
        error: '[data-cy="login-errors"]',
    },
    register: {
        lastname: '[data-cy="register-input-lastname"]',
        firstname: '[data-cy="register-input-firstname"]',
        email: '[data-cy="register-input-email"]',
        password: '[data-cy="register-input-password"]',
        confirm: '[data-cy="register-input-password-confirm"]',
        submit: '[data-cy="register-submit"]',
        error: '[data-cy="register-errors"]',
    },
    //rubrique produits
    products: {
        product: '[data-cy="product"]',
        picture: '[data-cy="product-picture"]',
        name: '[data-cy="product-name"]',
        ingredients: '[data-cy="product-ingredients"]',
    },
    //fiche produit
    product: {
        image: '[data-cy="detail-product-img"]',
        name: '[data-cy="detail-product-name"]',
        description: '[data-cy="detail-product-description"]',
        price: '[data-cy="detail-product-price"]',
        quantity: '[data-cy="detail-product-quantity"]',
        stock: '[data-cy="detail-product-stock"]',
        add: '[data-cy="detail-product-add"]',
    },

    reviewInput: {
        form: '[data-cy="review-form"]',
        ratingImages: '[data-cy="review-input-rating-images"]',
        rating: '[data-cy="review-input-rating"]',
        title: '[data-cy="review-input-title"]',
        comment: '[data-cy="review-input-comment"]',
        submit: '[data-cy="review-submit"]',
    },
    review: {
        detail: '[data-cy="review-detail"]',
        title: '[data-cy="review-title"]',
        comment: '[data-cy="review-comment"]',
        //todo
    },
    cart: {
        empty: '[data-cy="cart-empty"]',
        line: '[data-cy="cart-line"]',
        name: '[data-cy="cart-line-name"]',
        description: '[data-cy="cart-line-description"]',
        quantity: '[data-cy="cart-line-quantity"]',
        delete: '[data-cy="cart-line-delete"]',
        lineTotal: '[data-cy="cart-line-total"]',
        total: '[data-cy="cart-total"]',
    },
    cartInput: {
        lastname: '[data-cy="cart-input-lastname"]',
        firstname: '[data-cy="cart-input-firstname"]',
        address: '[data-cy="cart-input-address"]',
        zipCode: '[data-cy="cart-input-zipcode"]',
        city: '[data-cy="cart-input-city"]',
        submit: '[data-cy="cart-submit"]',
    },
};


export function loginApi() {
    return cy.env( ["testEmail", "testPassword"] ).then( ( {testEmail, testPassword} ) => {
        return cy.request(
            {
                method: 'POST',
                url: `${URL_API}/login`,
                body: {
                    username: testEmail,
                    password: testPassword
                }
            }
        ).then((response) => {
            expect(response.status).to.eq(200);

            const token = response.body.token;
            expect(token).to.be.a('string');

            return token;
        });
    });
}

export function loginUI() {
    cy.intercept('POST', '**/login').as('login');
    openLogin();

    cy.env(['testEmail', 'testPassword']).then(({ testEmail, testPassword }) => {
        fillLogin({
            email: testEmail,
            password: testPassword,
        })
        
        cy.get(selector.login.submit).click();
        cy.wait('@login').its('response.statusCode').should('eq', 200);
        cy.get(selector.nav.logout).should('be.visible');
    });
}

export function openLogin() {
    cy.visit('/');
    cy.get(selector.nav.login).click();
    cy.get(selector.login.email).should('be.visible');
}

export function openRegister() {
    cy.visit('/');
    cy.get(selector.nav.register).click();
    cy.get(selector.register.email).should('be.visible');
}

export function openCart() {
  cy.get(selector.nav.cart).click();
  cy.get(selector.cart.total).should('be.visible');
}

export function fillLogin({email, password }) {
    cy.get(selector.login.email).type(email);
    cy.get(selector.login.password).type(password, { log: false });
}

export function fillRegistration({ firstname, lastname, email, password }) {
    cy.get(selector.register.firstname).type(firstname);
    cy.get(selector.register.lastname).type(lastname);
    cy.get(selector.register.email).type(email);
    cy.get(selector.register.password).type(password, { log: false });
    cy.get(selector.register.confirm).type(password, { log: false });
}
export function fillCheckout({ firstname, lastname, address, zipcode, city }) {
    cy.get(selector.cartInput.firstname).clear().type(firstname);
    cy.get(selector.cartInput.lastname).clear().type(lastname);
    cy.get(selector.cartInput.address).clear().type(address);
    cy.get(selector.cartInput.zipCode).clear().type(zipcode);
    cy.get(selector.cartInput.city).clear().type(city);
}


// Selon l'application, un submit invalide peut être désactivé ou déclencher
// des erreurs de formulaire. Le message d'erreur reste une exigence à vérifier.
export function trySubmit(submitSelector) {
    cy.get(submitSelector).then( ($button) => {
        if ($button.is(':disabled')) {
            cy.wrap($button).should('be.disabled');
        } else {
            cy.wrap($button).click();
        }
    });
} 
//commentaire

export function addProductFromUI(productId, quantity) {
    cy.intercept('GET', `**/products/${productId}`).as('productLoaded');
    cy.visit(`/#/products/${productId}`);
    cy.wait('@productLoaded').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
    });

    // On renvoie l'objet produit DANS une chaîne Cypress, une fois les lectures terminées.
    return cy.get(selector.product.name).invoke('text').then((name) => {
        return cy.get(selector.product.price).invoke('text').then((price) => {
            const product = { 
                name: name.trim(), 
                priceCents: eurosToCents(price) 
            };
            cy.get(selector.product.quantity).clear().type(String(quantity));

            cy.intercept('PUT', '**/orders/add').as('productAdded');
            cy.get(selector.product.add).should('be.enabled').click();
            return cy.wait('@productAdded').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
                return product;
            });
        });
    });
}





export function assertVisibleError(selector) {
    cy.get(selector).should('be.visible');
}


// Prend en charge les prix usuels en français : "15 €", "9,99 €", "1 234,50 €".
export function eurosToCents(text) {
  const cleaned = String(text)
    .replace(/[\s\u00a0\u202f]/g, '') // supprime tous les types d'espaces
    .replace(/[^\d,.]/g, ''); // supprime tous les caractères qui ne sont pas des chiffres, des virgules ou des points
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.') // supprime les points de séparation pour les milliers puis remplace la virgule décimale (fr) par le point (international)
    : cleaned;
  const value = Number(normalized);
  if (!cleaned || !Number.isFinite(value)) {
    throw new Error(`Prix impossible à lire : ${text}`);
  }
  return Math.round(value * 100);
}


