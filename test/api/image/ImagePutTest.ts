import {User} from "../../../src/objects/User";
import {ResourceFileReader} from "../../../src/common/ResourceFileReader";
import {authenticateAsUser, expect, getSuperTest} from "../ApiTestUtils";
import {ApiPaths} from "../../cypress/support/paths/ApiPaths";
import {DatabaseQueries} from "../../../src/common/DatabaseQueries";

/**
 * Contains API test cases about the /image endpoint's PUT method
 */
describe('/image PUT', function ()
{
    const RESOURCE_PATH: string = '/api/image/';

    let userA: User;
    let userB: User;
    let authorizationHeaderUserA: object;
    let authorizationHeaderUserB: object;

    before(async function ()
    {
        userA = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json'));
        userB = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_b.json'));
        authorizationHeaderUserA = await authenticateAsUser(userA);
        authorizationHeaderUserB = await authenticateAsUser(userB);
    });


    /**
     * Pre-condition: Existing user with 'b@b.hu' email and '3' id.
     * Verifies that the number of image recognition entries update for an authenticated user.
     */
    it('Entries should increment', async function ()
    {
        await DatabaseQueries.getUserByEmail(userB.email).then(async (row) =>
        {
            const entriesBefore: number = Number(row.entries);
            const entriesAfter: number = Number(entriesBefore + 1);
            const response = await getSuperTest()
                .put(ApiPaths.IMAGE_PATH)
                .set(authorizationHeaderUserB)
                .send(ResourceFileReader.readTestResourceJsonSync(`${RESOURCE_PATH}imageRequest_user_b.json`));

            expect(response.status).to.be.equal(200);
            expect(Number(response.body.entries)).to.be.equal(entriesAfter);
        });
    });

    /**
     * Pre-condition: Existing users with 'b@b.hu'/'3' and 'a@a.hu'/'2' email/id pairs.
     * Verifies that the image entries update sends an error response if an authenticated user tries to increment
     * with a different id than his/hers.
     */
    it('Incrementing other user entries should throw error', async function ()
    {
        await DatabaseQueries.getUserByEmail(userB.email).then(async () =>
        {
            await DatabaseQueries.getUserByEmail(userA.email).then(async () =>
            {
                const response = await getSuperTest()
                    .put(ApiPaths.IMAGE_PATH)
                    .set(authorizationHeaderUserB)
                    .send(ResourceFileReader.readTestResourceJsonSync(`${RESOURCE_PATH}imageRequest_user_a.json`));

                expect(response.status).to.be.equal(400);
                expect(response.body.errorMessage).to.be.equal('Access denied.');
            });
        });
    });

    /**
     * Verifies that an anonymous user receives an error response if tries to call the endpoint.
     */
    it('Anonymous user request should throw error', async function ()
    {
        const response = await getSuperTest().put(ApiPaths.IMAGE_PATH);
        expect(response.status).to.equal(401);
        expect(response.body.errorMessage).to.equal('Unauthorized');
    });

    /**
     * Verifies that an error message is thrown if the required attributes are missing.
     */
    it('Missing required attributes should throw error', async function ()
    {
        const response = await getSuperTest()
            .put(ApiPaths.IMAGE_PATH)
            .set(authorizationHeaderUserB)
            .send('{}');

        expect(response.status).to.equal(400);
        expect(response.body.errorMessage).to.equal('Incorrect data.');
    });
});