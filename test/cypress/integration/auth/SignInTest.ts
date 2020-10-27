import {PagePaths} from "../../support/paths/PagePaths";
import {ApiPaths} from "../../support/paths/ApiPaths";
import {Pages} from "../../support/selectors/Pages";
import {AppPage} from "../../support/selectors/AppPage";
import {NavigationBar} from "../../support/selectors/NavigationBar";
import {clearSessionStorage} from "../../support/appactions/AuthActions";

describe('Sign In Test', function (): void
{
    const FIXTURES_AUTH_PATH: string = '/auth/';

    beforeEach(function (): void
    {
        clearSessionStorage();
        cy.visit(PagePaths.SIGNIN_PAGE);
        cy.get(Pages.SIGN_IN_PANEL).as('signInPanel').within(() =>
        {
            cy.get('#email-address').as('emailInput')
              .get('#password').as('passwordInput')
              .get('#signin-submit-btn').as('signInButton')
              .get('#signin-register-btn').as('registerButton');
        });
    });

    /**
     * Verifies that:
     * - Application panel is displayed
     * - The URL has changed
     * - Data from profile response is displayed
     */
    it('Successful sign in should redirect to face recognition app', function (): void
    {
        // Mocking a successful sign in and profile response
        cy.fixture(`${FIXTURES_AUTH_PATH}mocked_signInResponse_200.json`).as('successfulSignInResponse')
          .then(() =>
          {
              cy.fixture(`${FIXTURES_AUTH_PATH}mocked_profileResponse_200.json`).as('successfulProfileResponse')
                .then(() =>
                {
                    cy.route2AccessControl('POST', `**${ApiPaths.SIGNIN_PATH}`, 200, this.successfulSignInResponse);
                    cy.route2AccessControl('GET', `**${ApiPaths.PROFILE_PATH}/${this.successfulProfileResponse.id}`, 200, this.successfulProfileResponse);

                    cy.get('@emailInput').type('mockuser@mock.hu')
                      .get('@passwordInput').type('mockpw')
                      .get('@signInButton').click();

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
                })
          });
    });

    /**
     * Verifies that an error message is displayed.
     */
    it('Not existing user sign in should remain on sign in page', function (): void
    {
        // Mocking a bad request sign in response
        cy.fixture(`${FIXTURES_AUTH_PATH}mocked_signInResponse_400.json`).as('invalidSignInResponse')
          .then(() =>
          {
              cy.route2AccessControl('POST', `**${ApiPaths.SIGNIN_PATH}`, 400, this.invalidSignInresponse);

              cy.get('@emailInput').type('not@exists.hu')
                .get('@passwordInput').type('notauser')
                .get('@signInButton').click();

              cy.get('#signin-error-message').should('have.text', this.invalidSignInResponse.errorMessage);
          });
    });

    /**
     * Verifies that the must have elements for sign in are displayed and their content is correct.
     */
    it('Correct elements are displayed', function (): void
    {
        // Navigation bar elements
        cy.get(NavigationBar.REGISTER_BTN).should('be.visible').should('have.text', 'Register');
        cy.get(NavigationBar.SIGN_IN_BTN).should('be.visible').should('have.text', 'Sign in');
        // Sign in card elements
        cy.get(Pages.SIGN_IN_PANEL).within(() =>
        {
            cy.get('#signin-title').should('be.visible').should('have.text', 'Sign In')
              .get('#email-label').should('be.visible').should('have.text', 'Email')
              .get('#password-label').should('be.visible').should('have.text', 'Password')
              .get('@signInButton').should('have.value', 'Sign in')
              .get('@registerButton').should('have.text', 'Register');
        });
    });

    /**
     * Pre-condition: Given user with 'testmctestify@test.hu' e-mail exists in both 'users' and 'login' table.
     * Verifies that the user was successfully logged in and the expected user data is returned.
     */
    it('End to end sign in', function (): void
    {
        cy.fixture(`${FIXTURES_AUTH_PATH}e2e_signInRequest.json`).as('E2E_SIGNIN_REQ')
          .then(() =>
          {
              let expectedEmail = this.E2E_SIGNIN_REQ.email;
              let expectedPw = this.E2E_SIGNIN_REQ.password;
              cy.fixture(`${FIXTURES_AUTH_PATH}e2e_signInResponseExpected.json`).as('expectedResponse')
                .then(() =>
                {
                    cy.get('@emailInput').type(expectedEmail)
                      .get('@passwordInput').type(expectedPw)
                      .get('@signInButton').click();

                    cy.get(Pages.APP_PANEL).should('be.visible').within(() =>
                    {
                        cy.get(AppPage.CURRENT_COUNT_TXT).should('have.text', `${this.expectedResponse.name}, your current entry count is...`)
                          .get(AppPage.ENTRIES_TXT).should('have.text', `${this.expectedResponse.entries}`);
                    });
                });
          });
    });
})