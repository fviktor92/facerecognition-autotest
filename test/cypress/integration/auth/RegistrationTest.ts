import {NavigationBar} from "../../support/selectors/NavigationBar";
import {AppPage} from "../../support/selectors/AppPage";
import {compareSync} from "bcrypt-nodejs";
import {PagePaths} from "../../support/paths/PagePaths";
import {ApiPaths} from "../../support/paths/ApiPaths";
import {Pages} from "../../support/selectors/Pages";

describe('Registration Test', function (): void
{
    const FIXTURES_AUTH_PATH: string = '/auth/';

    beforeEach(function (): void
    {
        cy.visit(PagePaths.REGISTER_PAGE);
        cy.get(Pages.REGISTER_PANEL).as('registerPanel').within(() =>
        {
            cy.get('#name').as('nameInput')
              .get('#email-address').as('emailInput')
              .get('#password').as('passwordInput')
              .get('#register-register-btn').as('registerButton');
        });
    });


    /**
     * Verifies that:
     * - The URL has changed
     * - Application panel is displayed
     * - Data from registration response is displayed
     */
    it('New user successful registration should redirect to face recognition app', function (): void
    {
        // Mocking a successful registration response
        cy.fixture(`${FIXTURES_AUTH_PATH}mocked_registrationResponse_200.json`).as('successfulRegistrationResponse')
          .then((json: object) =>
          {
              cy.route2AccessControl('POST', `**${ApiPaths.REGISTER_PATH}`, 200, json)

              cy.get('@nameInput').type(this.successfulRegistrationResponse.name)
                .get('@emailInput').type(this.successfulRegistrationResponse.email)
                .get('@passwordInput').type('mockpw')
                .get('@registerButton').click();

              cy.get(Pages.APP_PANEL).should('be.visible').within(() =>
              {
                  cy.get(AppPage.LOGO_IMG).should('be.visible')
                    .get(AppPage.CURRENT_COUNT_TXT).should('have.text', `${this.successfulRegistrationResponse.name}, your current entry count is...`)
                    .get(AppPage.ENTRIES_TXT).should('have.text', `${this.successfulRegistrationResponse.entries}`)
                    .get(AppPage.DESCRIPTION_TXT).should('have.text', 'This Magic Brain will detect faces in your pictures. Give it a try!')
                    .get(AppPage.URL_INPUT).should('have.attr', 'placeholder', 'Enter picture URL')
                    .get(AppPage.DETECT_BTN).should('have.text', 'Detect').should('be.enabled');
              });
              cy.get(NavigationBar.SIGN_OUT_BTN).should('be.visible').should('have.text', 'Sign out');
              cy.url().then((url: string) => expect(Cypress.config().baseUrl + PagePaths.APP_PAGE).to.be.equal(url, 'url matches'));
          });
    });

    /**
     * Verifies that an error message is displayed.
     */
    it('Already Existing User Registration Should Remain on Registration Page', function (): void
    {
        // Mocking a bad request registration response
        cy.fixture(`${FIXTURES_AUTH_PATH}mocked_registrationResponse_400.json`).as('invalidRegistrationResponse')
          .then((json: object) =>
          {
              cy.route2AccessControl('POST', `**${ApiPaths.REGISTER_PATH}`, 200, json)

              cy.get('@nameInput').type('Already User')
                .get('@emailInput').type('already@exists.me')
                .get('@passwordInput').type('alreadypw')
                .get('@registerButton').click();

              cy.get('#register-error-message').should('have.text', this.invalidRegistrationResponse.errorMessage);
          });
    });

    /**
     * Verifies that the must have elements for registration are displayed and their content is correct.
     */
    it('Correct elements are displayed', function (): void
    {
        // Navigation bar elements
        cy.get(NavigationBar.REGISTER_BTN).should('be.visible').should('have.text', 'Register');
        cy.get(NavigationBar.SIGN_IN_BTN).should('be.visible').should('have.text', 'Sign in');
        // Register card elements
        cy.get(Pages.REGISTER_PANEL).within(() =>
        {
            cy.get('#register-title').should('be.visible').should('have.text', 'Register')
              .get('#name-label').should('be.visible').should('have.text', 'Name')
              .get('#email-label').should('be.visible').should('have.text', 'Email')
              .get('#password-label').should('be.visible').should('have.text', 'Password')
              .get('@registerButton').should('have.value', 'Register');
        });

    });

    /**
     * Pre-condition: User does not exists with the given e-mail.
     * Verifies that the user was successfully created by querying the database:
     * Users table: ID is created; Name, Email are stored; initial entries is 0; join date is today
     * Login table: ID is created; crypted password, email is stored
     */
    it('End to end registration', function (): void
    {
        cy.fixture(`${FIXTURES_AUTH_PATH}e2e_registrationRequest.json`).as('E2E_REG_REQUEST')
          .then(() =>
          {
              let expectedName: string = this.E2E_REG_REQUEST.name;
              let expectedEmail: string = this.E2E_REG_REQUEST.email;
              let expectedPw: string = this.E2E_REG_REQUEST.password;
              cy.task('deleteUserByEmail', expectedEmail).then(() =>
              {
                  cy.get('@nameInput').type(expectedName)
                    .get('@emailInput').type(expectedEmail)
                    .get('@passwordInput').type(expectedPw)
                    .get('@registerButton').click()
                    .get(Pages.APP_PANEL)
                    .then(() =>
                    {
                        cy.task('queryUserByEmail', this.E2E_REG_REQUEST.email).then((row: any) =>
                        {
                            let {id, name, email, entries, joined} = row;
                            let _joined: string = new Date(joined).toDateString();
                            let today: string = new Date().toDateString();
                            expect(id).to.be.a('number', 'id is number type');
                            expect(name).to.be.equal(expectedName, 'name matches');
                            expect(email).to.be.equal(expectedEmail, 'email matches');
                            expect(entries).to.be.equal('0', 'initial entry number is 0');
                            expect(_joined).to.be.equal(today, 'joined date is today');
                        });
                        cy.task('queryLoginByEmail', expectedEmail).then((row: any) =>
                        {
                            let {id, hash, email} = row;
                            expect(id).to.be.a('number', 'id is number type');
                            expect(compareSync(expectedPw, hash)).to.be.equal(true, 'password matches');
                            expect(email).to.be.equal(expectedEmail, 'email matches');
                        })
                    });
              });
          });
    });
});