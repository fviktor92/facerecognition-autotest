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
    const FIXTURES_APP_PATH: string = '/APP/';

    beforeEach(function (): void
    {
        cy.visit(PagePaths.APP_PAGE);
    });

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

    it.skip('Face recognition should display multiple boxes', function (): void
    {
        registerAuthenticationResponses(this);

        cy.fixture(`${FIXTURES_APP_PATH}mocked_imageurlResponse_multipleFaces_200.json`).then((imageurlResponse: object) =>
        {
            this.successfulImageurlResponse = imageurlResponse;
            cy.fixture(`${FIXTURES_APP_PATH}mocked_imageResponse_200.json`).then((imageResponse: object) =>
            {
                this.successfulImageResponse = imageResponse;

                cy.route2('GET', '**/kids.jpg', {
                      fixture: `${FIXTURES_APP_PATH}kids.jpg`,
                      headers: {
                          'content-type': 'image/jpg'
                      }
                  })
                  .route2('POST', `**${ApiPaths.IMAGEURL_PATH}`, {
                      statusCode: 200,
                      headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                      body: this.successfulImageurlResponse
                  })
                  .route2('PUT', `**${ApiPaths.IMAGE_PATH}`, {
                      statusCode: 200,
                      headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                      body: this.successfulImageResponse
                  });

                cy.get(AppPage.URL_INPUT).type('https://kamubabamama.hu/pics/kids.jpg')
                  .get(AppPage.DETECT_BTN).click();

                cy.get(AppPage.INPUT_IMG).matchImageSnapshot('multipleFaces');
            });
        });
    });

    it('Face recognition should not display boxes', function (): void
    {
        registerAuthenticationResponses(this);


    });

    it('End to end', function (): void
    {
        cy.fixture('user_default.json').then((userJson: object) =>
        {
            let defaultUser: User = Object.assign(User.prototype, userJson);
            authenticateUser(defaultUser);
            cy.visit(PagePaths.APP_PAGE);
        });
    });

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

