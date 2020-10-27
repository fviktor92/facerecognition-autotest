// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import {addMatchImageSnapshotCommand} from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
    updatePassedSnapshot: false,
    failureThreshold: 2.5,
    failureThresholdType: "percent",
    customDiffConfig: {threshold: 0.2}
});

/**
 * Custom 'route2' command that contains the Access-Control-Allow headers.
 */
Cypress.Commands.add('route2AccessControl', (httpMethod: any, urlMatcher: string, statusCode: number, body: string | object): Cypress.Chainable<null> =>
{
    return cy.route2(httpMethod, urlMatcher, {
        statusCode: statusCode,
        headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
        body: body
    });
});