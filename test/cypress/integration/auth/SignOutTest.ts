import {authenticateUser, getSessionStorage, TOKEN_ATTRIBUTE} from "../../support/appactions/AuthActions";
import {PagePaths} from "../../support/paths/PagePaths";
import {NavigationBar} from "../../support/selectors/NavigationBar";
import {Pages} from "../../support/selectors/Pages";

describe('Sign Out Test', function (): void
{
    it('End to end sign out should redirect to sign in page', function ()
    {
        cy.fixture('user_default.json').then((userJson: object) =>
        {
            authenticateUser(userJson);

            cy.visit(PagePaths.APP_PAGE);
            cy.get(NavigationBar.SIGN_OUT_BTN).click()
              .get(Pages.SIGN_IN_PANEL).should('be.visible');

            getSessionStorage().then(sessionStorage =>
            {
                expect(sessionStorage.getItem(TOKEN_ATTRIBUTE)).to.equal(null, "JWT should be removed from session storage.");
            });
        });
    });
});