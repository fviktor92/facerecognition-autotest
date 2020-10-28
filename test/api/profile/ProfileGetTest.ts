import {authenticateAsUser, expect, getSuperTest} from "../ApiTestUtils";
import {User} from "../../../src/objects/User";
import {ResourceFileReader} from "../../../src/common/ResourceFileReader";
import {ApiPaths} from "../../cypress/support/paths/ApiPaths";

/**
 * Contains API test cases about the /profile endpoint's GET method
 */
describe('/profile GET', function ()
{
    let userA: User;
    let authorizationHeaderUserA: object;

    before(async function ()
    {
        userA = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json'));
        authorizationHeaderUserA = await authenticateAsUser(userA);
        console.log(authorizationHeaderUserA);
    })

    /**
     * Pre-condition: An existing user with 'a@a.hu' email and id '2'.
     * Verifies that an authenticated user can successfully request its profile data.
     */
    it('Existing user profile request should be successful', async function ()
    {
        const today: string = new Date().toDateString();
        const response = await getSuperTest().get(`${ApiPaths.PROFILE_PATH}/2`).set(authorizationHeaderUserA);

        expect(response.status).to.equal(200);
        expect(response.body.id).to.be.a('number', 'id is number type');
        expect(response.body.name).to.be.equal(userA.name, 'name matches');
        expect(response.body.email).to.be.equal(userA.email, 'email matches');
        expect(response.body.entries).to.be.equal('0', 'initial entry number is 0');
        expect(new Date(response.body.joined).toDateString()).to.be.equal(today, 'joined date is today');
    });

    /**
     * Verifies that an authenticated user receives an error response if it tries to request non existing profile data.
     */
    it('Not existing user profile request should throw error', async function ()
    {

    });

    /**
     * Verifies that the endpoint requires authentication and it throws an error if it's called anonymously.
     */
    it('Anonymous user profile request should throw error', async function ()
    {

    });

    /**
     * Verifies that an authenticated user cannot access an other existing user's profile data.
     */
    it('User should not access other users profile data', async function ()
    {

    });
});