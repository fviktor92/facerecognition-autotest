const NAME_INPUT_SELECTOR: string = "#name";
const EMAIL_INPUT_SELECTOR: string = "#email-address";
const PASSWORD_INPUT_SELECTOR: string = "#password";
const REGISTER_BTN_SELECTOR: string = "#register-register-btn";

describe('Registration Test', function (): void
{
    beforeEach(function (): void
    {
        cy.visit("/register");
    });

    it('New user successful registration should redirect to face recognition app', function (): void
    {
        // Mocking a successful registration response
        cy.route2({
            url: '**/register',
            method: 'POST',
        }, (req) =>
        {
            req.body = '{"email":"mockuser@mock.mo","password":"mockpw","name":"Mock User"}';
            req.reply((res) =>
            {
                res.statusCode = 200;
                res.body = '{"id":3,"name":"Mock User","email":"mockuser@mock.mo","entries":"0","joined":"2020-09-15T16:52:49.329Z"}';
            });
        });

        cy.get(NAME_INPUT_SELECTOR).type("Mock User")
          .get(EMAIL_INPUT_SELECTOR).type("mockuser@mock.mo")
          .get(PASSWORD_INPUT_SELECTOR).type("mockpw")
          .get(REGISTER_BTN_SELECTOR).click();

        cy.get("#app-panel").should('be.visible');
    });

    it('Already Existing User Registration Should Remain on Registration Page', function (): void
    {
        // Mocking a bad request registration response
        cy.route2({
            url: '**/register',
            method: 'POST',
        }, (req) =>
        {
            req.body = '{"email":"already@exists.me","password":"alreadypw","name":"Already User"}';
            req.reply((res) =>
            {
                res.statusCode = 400;
                res.body = 'Unable to register. This e-mail address is already registered!';
            });
        });

        cy.get(NAME_INPUT_SELECTOR).type("Already User")
          .get(EMAIL_INPUT_SELECTOR).type("already@exists.me")
          .get(PASSWORD_INPUT_SELECTOR).type("alreadypw")
          .get(REGISTER_BTN_SELECTOR).click();

        cy.get("#register-error-message").should('have.text', 'Unable to register. This e-mail address is already registered!');
    });
});