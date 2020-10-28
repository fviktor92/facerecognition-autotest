import {ApiPaths} from "../../cypress/support/paths/ApiPaths";
import {expect, getSuperTest} from "../ApiTestUtils";
import {ResourceFileReader} from "../../../src/common/ResourceFileReader";
import {DatabaseQueries} from "../../../src/common/DatabaseQueries";
import {User} from "../../../src/objects/User";

/**
 * Contains API test cases about the /signin endpoint's POST method
 */
describe('/signin POST', function ()
{
    const resourcePath = '/api/signin/';

    /**
     * Pre-condition: Existing user with e-mail 'a@a.hu' in database.
     * Verifies that a successful response have the expected 200 status code and body.
     */
    it('Existing user sign in should be successful', async function ()
    {
        await DatabaseQueries.getLoginByEmail(Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json')).email).then(async () =>
        {
            const response = await getSuperTest()
                .post(ApiPaths.SIGNIN_PATH)
                .send(ResourceFileReader.readTestResourceJsonSync(`${resourcePath}signinRequest_user_a.json`));

            expect(response.status).to.equal(200);
            expect(response.body.userId).to.equal(2);
            expect(response.body.success).to.equal('true');
            expect(response.body.token).to.have.lengthOf.above(0);
        });
    });

    /**
     * Verifies that the response has a 400 status code and the expected error message when a user does not exists with the given email.
     */
    it('Non existing user sign in should throw error', async function ()
    {
        const response = await getSuperTest()
            .post(ApiPaths.SIGNIN_PATH)
            .send(ResourceFileReader.readTestResourceJsonSync(`${resourcePath}signinRequest_user_nonExisting.json`));

        expect(response.status).to.equal(400);
        expect(response.body.errorMessage).to.equal('Unable to sign in with this e-mail and password combination.');
    });

    /**
     * Verifies that the response has a 400 status code when the required 'email' and 'password' attributes are missing.
     */
    it('Missing required attributes should throw error', async function ()
    {
        const response = await getSuperTest()
            .post(ApiPaths.SIGNIN_PATH)
            .send('{}');

        expect(response.status).to.equal(400);
        expect(response.body.errorMessage).to.equal('Incorrect form submission');
    });

    /**
     * Verifies that the response has a 400 status code when the password is incorrect for an existing user.
     */
    it('Wrong credentials should throw error', async function ()
    {
        let existingUser: User = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json'));
        await DatabaseQueries.getLoginByEmail(existingUser.email).then(async () =>
        {
            const response = await getSuperTest()
                .post(ApiPaths.SIGNIN_PATH)
                .send(ResourceFileReader.readTestResourceJsonSync(`${resourcePath}signinRequest_user_a_wrongCredentials.json`));

            expect(response.status).to.equal(400)
            expect(response.body.errorMessage).to.equal('Unable to sign in with this e-mail and password combination.');
        });
    });
});