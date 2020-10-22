import {NavigationBar} from "../../support/selectors/NavigationBar";
import {AppPage} from "../../support/selectors/AppPage";
import {compareSync} from "bcrypt-nodejs";
import {RegisterPage} from "../../support/selectors/RegisterPage";
import {PagePaths} from "../../support/paths/PagePaths";
import {ApiPaths} from "../../support/paths/ApiPaths";

describe('Registration Test', function (): void
{
    const FIXTURES_AUTH_PATH: string = '/auth/';

    beforeEach(function (): void
    {
        cy.visit(PagePaths.REGISTER_PAGE);
    });

    it('New user successful registration should redirect to face recognition app', function (): void
    {
        // Mocking a successful registration response
        cy.fixture(`${FIXTURES_AUTH_PATH}mocked_registrationResponse_200.json`).then((json: object) =>
        {
            this.successfulRegistrationResponse = json;
            cy.route2('POST', `**/${ApiPaths.REGISTER_PATH}`, {
                statusCode: 200,
                headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                body: this.successfulRegistrationResponse
            });

            cy.get(RegisterPage.NAME_INPUT).type(this.successfulRegistrationResponse.name)
              .get(RegisterPage.EMAIL_INPUT).type(this.successfulRegistrationResponse.email)
              .get(RegisterPage.PASSWORD_INPUT).type('mockpw')
              .get(RegisterPage.REGISTER_BTN).click();

            cy.get(AppPage.APP_PANEL).should('be.visible');
            cy.url().then((url: string) => expect(Cypress.config().baseUrl + PagePaths.APP_PAGE).to.be.equal(url, 'The URL did not match!'));
        });
    });

    it('Already Existing User Registration Should Remain on Registration Page', function (): void
    {
        // Mocking a bad request registration response
        cy.fixture(`${FIXTURES_AUTH_PATH}mocked_registrationResponse_400.json`).then((json: object) =>
        {
            this.invalidRegistrationResponse = json;
            cy.route2('POST', `**/${ApiPaths.REGISTER_PATH}`, {
                statusCode: 400,
                headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
                body: this.invalidRegistrationResponse
            });

            cy.get(RegisterPage.NAME_INPUT).type('Already User')
              .get(RegisterPage.EMAIL_INPUT).type('already@exists.me')
              .get(RegisterPage.PASSWORD_INPUT).type('alreadypw')
              .get(RegisterPage.REGISTER_BTN).click();

            cy.get('#register-error-message').should('have.text', this.invalidRegistrationResponse.errorMessage);
        });
    });

    it('Correct elements are displayed', function (): void
    {
        // Navigation bar elements
        cy.get(NavigationBar.REGISTER_BTN).should('be.visible').should('have.text', 'Register');
        cy.get(NavigationBar.SIGN_IN_BTN).should('be.visible').should('have.text', 'Sign in');
        // Register card elements
        cy.get('#register-title').should('be.visible').should('have.text', 'Register');
        cy.get('#name-label').should('be.visible').should('have.text', 'Name');
        cy.get('#email-label').should('be.visible').should('have.text', 'Email');
        cy.get('#password-label').should('be.visible').should('have.text', 'Password');
        cy.get('#register-register-btn').should('have.value', 'Register');
    });

    it('End to end', function (): void
    {
        cy.fixture(`${FIXTURES_AUTH_PATH}e2e_registrationRequest.json`).then((json: object) => {
            this.E2E_REG_REQUEST = json;
            let expectedName: string = this.E2E_REG_REQUEST.name;
            let expectedEmail: string = this.E2E_REG_REQUEST.email;
            let expectedPw: string = this.E2E_REG_REQUEST.password;
            cy.task('deleteUserByEmail', expectedEmail).then(() => {
                cy.get(RegisterPage.NAME_INPUT).type(expectedName)
                  .get(RegisterPage.EMAIL_INPUT).type(expectedEmail)
                  .get(RegisterPage.PASSWORD_INPUT).type(expectedPw)
                  .get(RegisterPage.REGISTER_BTN).click()
                  .get(AppPage.APP_PANEL)
                  .then(() =>
                  {
                      cy.task('queryUserByEmail', this.E2E_REG_REQUEST.email).then((row: any) =>
                      {
                          let {id, name, email, entries, joined} = row;
                          let _joined: string = new Date(joined).toDateString();
                          let today: string = new Date().toDateString();
                          expect(id).to.be.a('number', 'id was not a number type');
                          expect(name).to.be.equal(expectedName, 'name did not match');
                          expect(email).to.be.equal(expectedEmail, 'email did not match');
                          expect(entries).to.be.equal('0', 'initial entry number was not 0');
                          expect(_joined).to.be.equal(today, 'joined date was not today');
                      });
                      cy.task('queryLoginByEmail', expectedEmail).then((row: any) =>
                      {
                          let {id, hash, email} = row;
                          expect(id).to.be.a('number', 'id was not a number type');
                          expect(compareSync(expectedPw, hash)).to.be.equal(true, 'password did not match');
                          expect(email).to.be.equal(expectedEmail, 'email did not match');
                      })
                  });
            });
        });
    });
});