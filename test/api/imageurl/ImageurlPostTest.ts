import {User} from "../../../src/objects/User";
import {ResourceFileReader} from "../../../src/common/ResourceFileReader";
import {authenticateAsUser, expect, getSuperTest} from "../ApiTestUtils";
import {ApiPaths} from "../../cypress/support/paths/ApiPaths";

/**
 * Contains API test cases about the /imageurl endpoint's POST method
 */
describe('/imageurl POST', function ()
{
    const RESOURCE_PATH: string = '/api/imageurl/';

    let userA: User;
    let authorizationHeaderUserA: object;

    before(async function ()
    {
        userA = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json'));
        authorizationHeaderUserA = await authenticateAsUser(userA);
    });

    /**
     * Verifies that if an authenticated user sends a valid image url that has faces,
     * then a successful response is returned with the regions of bounding boxes.
     * Not testing the exact values of the bounding boxes, because it is calculated by Clarifai API.
     */
    it('Image url should return data of face positions', async function ()
    {
        this.timeout(10000); // Face recognition takes time, default timeout is 2s
        const response = await getSuperTest()
            .post(ApiPaths.IMAGEURL_PATH)
            .set(authorizationHeaderUserA)
            .send(ResourceFileReader.readTestResourceJsonSync(`${RESOURCE_PATH}imageurlRequest_withFaces.json`));

        expect(response.status).to.equal(200);
        response.body.outputs[0].data.regions.forEach((region: any) =>
        {
            let box = region.region_info.bounding_box;
            expect(box.top_row).to.be.a('number', 'top_row is a number type');
            expect(box.left_col).to.be.a('number', 'left_col is a number type');
            expect(box.bottom_row).to.be.a('number', 'bottom_row is a number type');
            expect(box.right_col).to.be.a('number', 'right_col is a number type');
        });
    });

    /**
     * Verifies that if an authenticated user sends a valid image url that has no faces,
     * then a successful response is returned with no regions.
     */
    it('Image url should return empty data for no faces', async function ()
    {
        this.timeout(10000); // Face recognition takes time, default timeout is 2s
        const response = await getSuperTest()
            .post(ApiPaths.IMAGEURL_PATH)
            .set(authorizationHeaderUserA)
            .send(ResourceFileReader.readTestResourceJsonSync(`${RESOURCE_PATH}imageurlRequest_dog.json`));

        expect(response.status).to.equal(200);
        expect(response.body.outputs[0].data.regions).to.be.equal(undefined);
    });

    /**
     * Verifies that if an authenticated user sends an invalid url, then an error message is returned.
     */
    it('Image url should throw error for invalid url', async function ()
    {
        const response = await getSuperTest()
            .post(ApiPaths.IMAGEURL_PATH)
            .set(authorizationHeaderUserA)
            .send(ResourceFileReader.readTestResourceJsonSync(`${RESOURCE_PATH}imageurlRequest_invalidUrl.json`));

        expect(response.status).to.be.equal(400);
        expect(response.body.errorMessage).to.be.equal('Unable to work with API');
    });

    /**
     * Verifies that the endpoint required authentication and an error message is thrown if it's called anonymously.
     */
    it('Anonymous user request should throw error', async function ()
    {
        const response = await getSuperTest().post(ApiPaths.IMAGEURL_PATH);
        expect(response.status).to.equal(401);
        expect(response.body.errorMessage).to.equal('Unauthorized');
    });

    /**
     * Verifies that an error message is thrown if the required attributes are missing.
     */
    it('Missing required attributes should throw error', async function ()
    {
        const response = await getSuperTest()
            .post(ApiPaths.IMAGEURL_PATH)
            .set(authorizationHeaderUserA)
            .send('{}');

        expect(response.status).to.equal(400);
        expect(response.body.errorMessage).to.equal('Incorrect data.');
    });
});