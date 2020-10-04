import {NavigationBar} from "../../support/selectors/NavigationBar";
import {AppPage} from "../../support/selectors/AppPage";
import {compareSync} from "bcrypt-nodejs";

const NAME_INPUT_SELECTOR: string = '#name';
const EMAIL_INPUT_SELECTOR: string = '#email-address';
const PASSWORD_INPUT_SELECTOR: string = '#password';
const REGISTER_BTN_SELECTOR: string = '#register-register-btn';

describe('Registration Test', function (): void
{
    beforeEach(function (): void
    {
        cy.visit('/register');
    });

    after(function (): void
    {

    });

    it('New user successful registration should redirect to face recognition app', function (): void
    {
        // Mocking a successful registration response
        cy.route2('POST', '**/register', {
            statusCode: 200,
            headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
            body: '{"id":3,"name":"Mock User","email":"mockuser@mock.mo","entries":"0","joined":"2020-09-15T16:52:49.329Z"}'
        });

        cy.get(NAME_INPUT_SELECTOR).type('Mock User')
          .get(EMAIL_INPUT_SELECTOR).type('mockuser@mock.mo')
          .get(PASSWORD_INPUT_SELECTOR).type('mockpw')
          .get(REGISTER_BTN_SELECTOR).click();

        cy.get(AppPage.APP_PANEL).should('be.visible');
        cy.url().then((url: string) => expect(url.endsWith('/app')).to.be.true);
    });

    it('Already Existing User Registration Should Remain on Registration Page', function (): void
    {
        // Mocking a bad request registration response
        cy.route2('POST', '**/register', {
            statusCode: 400,
            headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'},
            body: '{"errorMessage": "Unable to register. This e-mail address is already registered!"}'
        });

        cy.get(NAME_INPUT_SELECTOR).type('Already User')
          .get(EMAIL_INPUT_SELECTOR).type('already@exists.me')
          .get(PASSWORD_INPUT_SELECTOR).type('alreadypw')
          .get(REGISTER_BTN_SELECTOR).click();

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

    it.only('End to end', function (): void
    {
        let expectedName: string = 'Endto End';
        let expectedEmail: string = 'endtoend@test.com';
        let expectedPw: string = 'e2e';
        cy.get(NAME_INPUT_SELECTOR).type(expectedName)
          .get(EMAIL_INPUT_SELECTOR).type(expectedEmail)
          .get(PASSWORD_INPUT_SELECTOR).type(expectedPw)
          .get(REGISTER_BTN_SELECTOR).click()
          .get(AppPage.APP_PANEL)
          .then(() =>
          {
              cy.task('queryUserByEmail', expectedEmail).then((row: any) =>
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