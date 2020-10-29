import {authenticateAsUser, expect, getSuperTest} from "../ApiTestUtils";
import {User} from "../../../src/objects/User";
import {ResourceFileReader} from "../../../src/common/ResourceFileReader";
import {ApiPaths} from "../../cypress/support/paths/ApiPaths";
import {DatabaseQueries} from "../../../src/common/DatabaseQueries";

/**
 * Contains API test cases about the /profile endpoint's GET method
 */
describe('/profile GET', function ()
{
    const RESOURCE_PATH: string = '/api/profile/';

    let userA: User;
    let authorizationHeaderUserA: object;

    before(async function ()
    {
        userA = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json'));
        authorizationHeaderUserA = await authenticateAsUser(userA);
    });

    /**
     * Pre-condition: An existing user with 'a@a.hu' email and id '2'.
     * Verifies that an authenticated user can successfully request its profile data.
     */
    it('Existing user profile request should be successful', async function ()
    {
        await DatabaseQueries.getUserByEmail(userA.email).then(async (row) =>
        {
            const expectedResponse = ResourceFileReader.readTestResourceJsonSync(`${RESOURCE_PATH}profileResponse_user_a.json`);
            const response = await getSuperTest().get(`${ApiPaths.PROFILE_PATH}/2`).set(authorizationHeaderUserA);

            expect(response.status).to.equal(200);

            expect(response.body.id).to.be.equal(expectedResponse.id, 'id matches')
            expect(response.body.name).to.be.equal(expectedResponse.name, 'name matches');
            expect(response.body.email).to.be.equal(expectedResponse.email, 'email matches');
            expect(response.body.entries).to.be.equal(expectedResponse.entries, 'initial entry number is 0');
            expect(new Date(response.body.joined).toDateString()).to.be.equal(new Date(expectedResponse.joined).toDateString(), 'joined date matches');
        });
    });

    /**
     * Verifies that an authenticated user receives an error response if it tries to request non existing profile data.
     */
    it('Not existing user profile request should throw error', async function ()
    {
        const response = await getSuperTest().get(`${ApiPaths.PROFILE_PATH}/9999`).set(authorizationHeaderUserA);

        expect(response.status).to.equal(404);
        expect(response.body.errorMessage).to.equal('Not found');
    });

    /**
     * Pre-condition: An existing user with 'a@a.hu' email and id '2'.
     * Verifies that the endpoint requires authentication and it throws an error if it's called anonymously.
     */
    it('Anonymous user profile request should throw error', async function ()
    {
        await DatabaseQueries.getUserByEmail(userA.email).then(async () =>
        {
            const response = await getSuperTest().get(`${ApiPaths.PROFILE_PATH}/2`);
            expect(response.status).to.equal(401);
            expect(response.body.errorMessage).to.equal('Unauthorized');
        });
    });

    /**
     * Verifies that an invalid profile id throws an error
     */
    it('Invalid profile id should throw error', async function ()
    {
        const response = await getSuperTest().get(`${ApiPaths.PROFILE_PATH}/${userA.name}`).set(authorizationHeaderUserA);

        expect(response.status).to.equal(400);
        expect(response.body.errorMessage).to.equal('Error getting user');
    });
});