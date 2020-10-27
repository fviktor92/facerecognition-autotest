/// <reference types="cypress" />
declare namespace Cypress
{
    interface Chainable
    {
        /**
         * Custom 'route2' stubbing, that contains the Access-Control headers.
         * @param httpMethod The method of the request.
         * @param {string} urlMatcher See {RouteMatcher}
         * @param {number} statusCode The expected status code of the response.
         * @param {string | object} body The expected body of the response.
         * @returns {Cypress.Chainable<null>}
         */
        route2AccessControl(httpMethod: any, urlMatcher: string, statusCode: number, body: string | object): Chainable<null>;
    }
}