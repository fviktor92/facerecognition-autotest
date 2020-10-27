/// <reference path="../../support/index.d.ts" />

import {authenticateUser, useAuthToken} from "../../support/appactions/AuthActions";
import {PagePaths} from "../../support/paths/PagePaths";
import {ApiPaths} from "../../support/paths/ApiPaths";
import {Pages} from "../../support/selectors/Pages";
import {AppPage} from "../../support/selectors/AppPage";
import {NavigationBar} from "../../support/selectors/NavigationBar";
import {Context} from "mocha";

describe('App Test', function (): void
{
    const FIXTURES_APP_PATH: string = '/app/';

    beforeEach(function (): void
    {
        cy.visit(PagePaths.APP_PAGE);
    });

    /**
     * Verifies that the must have elements for the app are displayed and their content is correct.
     */
    it('App page should have correct elements displayed', function (): void
    {
        stubAuthenticationResponses(this);

        cy.get(Pages.APP_PANEL).should('be.visible').within(() =>
        {
            cy.get(AppPage.LOGO_IMG).should('be.visible')
              .get(AppPage.CURRENT_COUNT_TXT).should('have.text', `${this.successfulProfileResponse.name}, your current entry count is...`)
              .get(AppPage.ENTRIES_TXT).should('have.text', `${this.successfulProfileResponse.entries}`)
              .get(AppPage.DESCRIPTION_TXT).should('have.text', 'This Magic Brain will detect faces in your pictures. Give it a try!')
              .get(AppPage.URL_INPUT).should('have.attr', 'placeholder', 'Enter picture URL')
              .get(AppPage.DETECT_BTN).should('have.text', 'Detect').should('be.enabled');
        });
        cy.get(NavigationBar.SIGN_OUT_BTN).should('have.text', 'Sign out');
        cy.url().then((url: string) => expect(Cypress.config().baseUrl + PagePaths.APP_PAGE).to.be.equal(url, 'url matches'));
    });

    /**
     * Visually verifies that the image is displayed and no boundary face boxes are displayed.
     * (No face boxes are displayed when the response have no data boundary boxes)
     */
    it('Face recognition should not display boxes', function (): void
    {
        stubAuthenticationResponses(this);

        cy.route2('GET', '**/retriever.jpg', {
            fixture: `${FIXTURES_APP_PATH}retriever.jpg`,
            headers: {
                'content-type': 'image/jpg'
            }
        });
        cy.fixture(`${FIXTURES_APP_PATH}mocked_imageurlResponse_noFaces_200.json`)
          .then(json => cy.route2AccessControl('POST', `**${ApiPaths.IMAGEURL_PATH}`, 200, json).as('imageurlResponse'));
        cy.fixture(`${FIXTURES_APP_PATH}mocked_imageResponse_200.json`)
          .then(json => cy.route2AccessControl('PUT', `**${ApiPaths.IMAGE_PATH}`, 200, json));

        typeImageUrlAndDetect(`${Cypress.config().baseUrl}/retriever.jpg`);

        cy.wait('@imageurlResponse');
        cy.get(AppPage.INPUT_IMG).matchImageSnapshot('noFaces');
    });

    /**
     * Verifies that an error message is displayed instead of an image when the API return error.
     * Test is retried once, because there's an issue with previous tests image snapshot comparison.
     */
    it('Error message should be displayed', {retries: 1}, function (): void
    {
        stubAuthenticationResponses(this);

        cy.fixture(`${FIXTURES_APP_PATH}mocked_imageurlResponse_errorMessage_400.json`).as('errorMessageResponse').then(json => cy.route2AccessControl('POST', `**${ApiPaths.IMAGEURL_PATH}`, 400, json));

        typeImageUrlAndDetect('https://fakepage.com/invalidimg.jpg');

        cy.get(Pages.APP_PANEL).within(() =>
        {
            cy.get(AppPage.ERROR_MESSAGE).should('have.text', this.errorMessageResponse.errorMessage);
            cy.get(AppPage.INPUT_IMG).should('not.be.visible');
        });
    });

    /**
     * Verifies that a new image can be face recognized when there is an image already submitted.
     */
    it('New image input url should replace existing image', function (): void
    {

    });

    /**
     * Verifies that when a picture of an URL is submitted:
     * - Entry count is incremented
     * - Visually verifies that the image is displayed and 2 boundary face boxes are displayed.
     */
    it('End to end', {retries: 1}, function (): void
    {
        cy.fixture('user_default.json').then(authenticateUser);

        cy.get(AppPage.ENTRIES_TXT).then(($div) =>
        {
            const beforeEntries: number = parseInt($div.text());
            typeImageUrlAndDetect('https://portal.clarifai.com/cms-assets/20180320221615/face-001.jpg');
            cy.get(AppPage.ENTRIES_TXT).should('have.text', beforeEntries + 1);
        })

        cy.get(AppPage.BOUNDING_BOX_DIVS, {timeout: 20000});
        cy.get(AppPage.INPUT_IMG).should('not.have.css', 'height', '0px'); // Wait for the image to be actually displayed to take the snapshot
        cy.get(AppPage.INPUT_IMG).matchImageSnapshot('e2e_multipleFaces');
    });

    const typeImageUrlAndDetect = (url: string) =>
    {
        cy.get(AppPage.URL_INPUT).type(url)
          .get(AppPage.DETECT_BTN).click();
    };

    const stubAuthenticationResponses = (testContext: Context) =>
    {
        // Mocking a successful sign in and profile response
        cy.fixture(`${FIXTURES_APP_PATH}mocked_signInResponse_200.json`).then((signInJson) =>
        {
            testContext.successfulSignInResponse = signInJson;
            cy.route2AccessControl('POST', `**${ApiPaths.SIGNIN_PATH}`, 200, signInJson);
            cy.fixture(`${FIXTURES_APP_PATH}mocked_profileResponse_200.json`).then((profileJson) =>
            {
                testContext.successfulProfileResponse = profileJson;
                cy.route2AccessControl('GET', `**${ApiPaths.PROFILE_PATH}/${profileJson.id}`, 200, profileJson);
                useAuthToken(signInJson.token);
                cy.reload();
            });
        });
    };
});

