import {authenticateUser, useAuthToken} from "../../support/appactions/AuthActions";
import {User} from "../../../../src/objects/User";
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
        registerAuthenticationResponses(this);

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
        registerAuthenticationResponses(this);

        cy.route2('GET', '**/retriever.jpg', {
              fixture: `${FIXTURES_APP_PATH}retriever.jpg`,
              headers: {
                  'content-type': 'image/jpg'
              }
          })
          .route2('POST', `**${ApiPaths.IMAGEURL_PATH}`, {
              statusCode: 200,
              headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
              fixture: `${FIXTURES_APP_PATH}mocked_imageurlResponse_noFaces_200.json`
          }).as('imageurlResponse')
          .route2('PUT', `**${ApiPaths.IMAGE_PATH}`, {
              statusCode: 200,
              headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
              fixture: `${FIXTURES_APP_PATH}mocked_imageResponse_200.json`
          });

        cy.get(AppPage.URL_INPUT).type(`${Cypress.config().baseUrl}/retriever.jpg`)
          .get(AppPage.DETECT_BTN).click();

        cy.wait('@imageurlResponse');
        cy.get(AppPage.INPUT_IMG).matchImageSnapshot('noFaces');
    });

    /**
     * Verifies that an error message is displayed instead of an image when the API return error.
     */
    it('Error message should be displayed', {retries: 1}, function (): void
    {
        registerAuthenticationResponses(this);

        cy.fixture(`${FIXTURES_APP_PATH}mocked_imageurlResponse_errorMessage_400.json`).as('errorMessageResponse').then(json =>
        {
            this.errorMessageResponse = json;
            cy.route2('POST', `**${ApiPaths.IMAGEURL_PATH}`, {
                statusCode: 400,
                headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                body: json
            });
        });

        cy.get(AppPage.URL_INPUT).type('https://fakepage.com/invalidimg.jpg')
          .get(AppPage.DETECT_BTN).click();

        cy.get(Pages.APP_PANEL).within(() =>
        {
            cy.get(AppPage.ERROR_MESSAGE).should('have.text', this.errorMessageResponse.errorMessage);
            cy.get(AppPage.INPUT_IMG).should('not.be.visible');
        });
    });

    /**
     * Verifies that when a picture of an URL is submitted:
     * - Entry count is incremented
     * - Visually verifies that the image is displayed and 2 boundary face boxes are displayed.
     */
    it('End to end', {retries: 1}, function (): void
    {
        cy.fixture('user_default.json').then((userJson: object) =>
        {
            let defaultUser: User = Object.assign(User.prototype, userJson);
            authenticateUser(defaultUser);
        });

        cy.get(AppPage.ENTRIES_TXT).then(($div) =>
        {
            const beforeEntries: number = parseInt($div.text());
            cy.get(AppPage.URL_INPUT).type('https://portal.clarifai.com/cms-assets/20180320221615/face-001.jpg')
              .get(AppPage.DETECT_BTN).click();
            cy.get(AppPage.ENTRIES_TXT).should('have.text', beforeEntries + 1);
        })

        cy.get(AppPage.BOUNDING_BOX_DIVS, {timeout: 20000})
          .get(AppPage.INPUT_IMG).matchImageSnapshot('e2e_multipleFaces');
    })

    const registerAuthenticationResponses = (testContext: Context) =>
    {
        // Mocking a successful sign in and profile response
        cy.fixture(`${FIXTURES_APP_PATH}mocked_signInResponse_200.json`).then((signInJson) =>
        {
            testContext.successfulSignInResponse = signInJson;
            cy.fixture(`${FIXTURES_APP_PATH}mocked_profileResponse_200.json`).then((profileJson) =>
            {
                testContext.successfulProfileResponse = profileJson;
                cy.route2('POST', `**${ApiPaths.SIGNIN_PATH}`, {
                      statusCode: 200,
                      headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                      body: signInJson
                  })
                  .route2('GET', `**${ApiPaths.PROFILE_PATH}/${profileJson.id}`, {
                      statusCode: 200,
                      headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                      body: profileJson
                  });
                useAuthToken(signInJson.token);
                cy.reload();
            });
        });
    }
});

