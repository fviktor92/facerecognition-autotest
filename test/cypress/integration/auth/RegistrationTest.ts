import {NavigationBar} from "../../support/selectors/NavigationBar";
import {AppPage} from "../../support/selectors/AppPage";
import {compareSync} from "bcrypt-nodejs";
import {RegisterPage} from "../../support/selectors/RegisterPage";


const expectedE2EEmail: string = 'endtoend@test.com';

describe('Registration Test', function (): void
{
    before(function (): void
    {
        cy.task('deleteUserByEmail', expectedE2EEmail);
    })

    beforeEach(function (): void
    {
        cy.visit('/register');
    });

    it('New user successful registration should redirect to face recognition app', function (): void
    {
        // Mocking a successful registration response
        cy.route2('POST', '**/register', {
            statusCode: 200,
            headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
            body: '{"id":3,"name":"Mock User","email":"mockuser@mock.mo","entries":"0","joined":"2020-09-15T16:52:49.329Z"}'
        });

        cy.get(RegisterPage.NAME_INPUT).type('Mock User')
          .get(RegisterPage.EMAIL_INPUT).type('mockuser@mock.mo')
          .get(RegisterPage.PASSWORD_INPUT).type('mockpw')
          .get(RegisterPage.REGISTER_BTN).click();

        cy.get(AppPage.APP_PANEL).should('be.visible');
        cy.url().then((url: string) => expect(Cypress.config().baseUrl + '/app').to.be.equal(url, 'The URL did not match!'));
    });

    it('Already Existing User Registration Should Remain on Registration Page', function (): void
    {
        // Mocking a bad request registration response
        cy.route2('POST', '**/register', {
            statusCode: 400,
            headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
            body: '{"errorMessage": "Unable to register. This e-mail address is already registered!"}'
        });

        cy.get(RegisterPage.NAME_INPUT).type('Already User')
          .get(RegisterPage.EMAIL_INPUT).type('already@exists.me')
          .get(RegisterPage.PASSWORD_INPUT).type('alreadypw')
          .get(RegisterPage.REGISTER_BTN).click();

        cy.get('#register-error-message').should('have.text', 'Unable to register. This e-mail address is already registered!');
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
        let expectedName: string = 'Endto End';
        let expectedPw: string = 'e2e';
        cy.get(RegisterPage.NAME_INPUT).type(expectedName)
          .get(RegisterPage.EMAIL_INPUT).type(expectedE2EEmail)
          .get(RegisterPage.PASSWORD_INPUT).type(expectedPw)
          .get(RegisterPage.REGISTER_BTN).click()
          .get(AppPage.APP_PANEL)
          .then(() =>
          {
              cy.task('queryUserByEmail', expectedE2EEmail).then((row: any) =>
              {
                  let {id, name, email, entries, joined} = row;
                  let _joined: string = new Date(joined).toDateString();
                  let today: string = new Date().toDateString();
                  expect(id).to.be.a('number', 'id was not a number type');
                  expect(name).to.be.equal(expectedName, 'name did not match');
                  expect(email).to.be.equal(expectedE2EEmail, 'email did not match');
                  expect(entries).to.be.equal('0', 'initial entry number was not 0');
                  expect(_joined).to.be.equal(today, 'joined date was not today');
              });
              cy.task('queryLoginByEmail', expectedE2EEmail).then((row: any) =>
              {
                  let {id, hash, email} = row;
                  expect(id).to.be.a('number', 'id was not a number type');
                  expect(compareSync(expectedPw, hash)).to.be.equal(true, 'password did not match');
                  expect(email).to.be.equal(expectedE2EEmail, 'email did not match');
              })
          });
    });
});