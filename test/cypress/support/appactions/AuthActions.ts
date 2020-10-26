/// <reference types="cypress" />

import {ApiPaths} from "../paths/ApiPaths";
import AUTWindow = Cypress.AUTWindow;
import {User} from "../../../../src/objects/User";

export const TOKEN_ATTRIBUTE: string = 'token';

export const clearSessionStorage = (): void =>
{
    getSessionStorage().then(sessionStorage => sessionStorage.clear);
}

export const authenticateUser = (user: User): void =>
{
    getJWT(user).then((result: any) =>
    {
        useAuthToken(result);
        cy.reload();
    });
};

export const deauthenticateUser = (): void =>
{
    getSessionStorage().then(sessionStorage => sessionStorage.removeItem(TOKEN_ATTRIBUTE));
    cy.reload();
};

export const getSessionStorage = (): Cypress.Chainable<Storage> =>
{
    return cy.window().then((win: AUTWindow) =>
    {
        return win.sessionStorage;
    });
};

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

