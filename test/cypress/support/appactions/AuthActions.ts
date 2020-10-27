/// <reference types="cypress" />

import {ApiPaths} from "../paths/ApiPaths";
import AUTWindow = Cypress.AUTWindow;
import {User} from "../../../../src/objects/User";

export const TOKEN_ATTRIBUTE: string = 'token';

/**
 * Authentication action that clears the session storage.
 */
export const clearSessionStorage = (): void =>
{
    getSessionStorage().then(sessionStorage => sessionStorage.clear);
}

/**
 * Authenticates the given user, by setting the JWT to the session storage. Reloads the page to take effect.
 * @example cy.fixture('user_default.json').then(authenticateUser);
 * @param user See {User}
 */
export const authenticateUser = (user: string | object): void =>
{
    getJWT(Object.assign(User.prototype, user)).then((result: any) =>
    {
        useAuthToken(result);
        cy.reload();
    });
};

/**
 * De-authenticates the current user, by removing the JWT from the session storage. Reloads the page to take effect.
 */
export const deauthenticateUser = (): void =>
{
    getSessionStorage().then(sessionStorage => sessionStorage.removeItem(TOKEN_ATTRIBUTE));
    cy.reload();
};

/**
 * @returns {Cypress.Chainable<Storage>}
 */
export const getSessionStorage = (): Cypress.Chainable<Storage> =>
{
    return cy.window().then((win: AUTWindow) =>
    {
        return win.sessionStorage;
    });
};

/**
 * Sets the JWT to the session storage.
 * @param {string} authToken
 */
export const useAuthToken = (authToken: string): void =>
{
    getSessionStorage().then(sessionStorage => sessionStorage.setItem(TOKEN_ATTRIBUTE, authToken));
};

const getJWT = (user: User) =>
{
    let apiBaseUrl: string;
    return cy.task('getApiBaseUrl').then((result: any) =>
    {
        apiBaseUrl = result;
        cy.request({
              method: 'POST',
              url: apiBaseUrl + ApiPaths.SIGNIN_PATH,
              body: {
                  email: user.email,
                  password: user.password
              }
          })
          .then((response: Cypress.Response) =>
          {
              expect(response.status).to.equal(200, `Authenticated user ${user.name}!`);
              return response.body[TOKEN_ATTRIBUTE];
          });
    });
};

