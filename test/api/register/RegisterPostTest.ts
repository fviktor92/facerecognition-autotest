import {User} from "../../../src/objects/User";
import {ResourceFileReader} from "../../../src/common/ResourceFileReader";
import {DatabaseQueries} from "../../../src/common/DatabaseQueries";
import {expect, getSuperTest} from "../ApiTestUtils";
import {ApiPaths} from "../../cypress/support/paths/ApiPaths";
import {compareSync} from "bcrypt-nodejs";

/**
 * Contains API test cases about the /register endpoint's POST method
 */
describe('/register POST', function ()
{
    const resourcePath = '/api/register/';
    /**
     * Pre-condition: User does not exists with the given e-mail.
     * Verifies that the user was successfully created by querying the database:
     * Users table: ID is created; Name, Email are stored; initial entries is 0; join date is today
     * Login table: ID is created; crypted password, email is stored
     */
    it('New user should be able to register', async function ()
    {
        const expectedUser: User = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync(`${resourcePath}registrationRequest_user_restToEnd.json`));
        const today: string = new Date().toDateString();

        await DatabaseQueries.deleteUserByEmail(expectedUser.email).then(async () =>
        {
            await getSuperTest()
                .post(ApiPaths.REGISTER_PATH)
                .send(expectedUser)
                .then((response) =>
                {

                    expect(response.status).to.equal(200);
                    expect(response.body.id).to.be.a('number', 'id is number type');
                    expect(response.body.name).to.be.equal(expectedUser.name, 'name matches');
                    expect(response.body.email).to.be.equal(expectedUser.email, 'email matches');
                    expect(response.body.entries).to.be.equal('0', 'initial entry number is 0');
                    expect(new Date(response.body.joined).toDateString()).to.be.equal(today, 'joined date is today');
                });


            await DatabaseQueries.getUserByEmail(expectedUser.email).then(async (row) =>
            {
                const {id, name, email, entries, joined} = row;
                const _joined: string = new Date(joined).toDateString();
                expect(id).to.be.a('number', 'id is number type');
                expect(name).to.be.equal(expectedUser.name, 'name matches');
                expect(email).to.be.equal(expectedUser.email, 'email matches');
                expect(entries).to.be.equal('0', 'initial entry number is 0');
                expect(_joined).to.be.equal(today, 'joined date is today');
            });

            await DatabaseQueries.getLoginByEmail(expectedUser.email).then(async (row) =>
            {
                let {id, hash, email} = row;
                expect(id).to.be.a('number', 'id is number type');
                expect(compareSync(expectedUser.password, hash)).to.be.equal(true, 'password matches');
                expect(email).to.be.equal(expectedUser.email, 'email matches');
            });
        });
    });

    /**
     * Verifies that a status code 400 and an error message is received for an already taken email.
     */
    it('User should receive error for already registered email', async function ()
    {
        let existingUser: User = Object.assign(User.prototype, ResourceFileReader.readTestResourceJsonSync('user_a.json'));
        await DatabaseQueries.getUserByEmail(existingUser.email).then(async () =>
        {
            const response = await getSuperTest()
                .post(ApiPaths.REGISTER_PATH)
                .send(existingUser);

            expect(response.status).to.equal(400);
            expect(response.body.errorMessage).to.equal('Unable to register. This e-mail address is already registered.');
        });
    });

    /**
     * Verifies that the response has a 400 status code when the required 'email' and 'password' attributes are missing.
     */
    it('Missing required attributes should throw error', async function ()
    {
        const response = await getSuperTest()
            .post(ApiPaths.REGISTER_PATH)
            .send('{}');

        expect(response.status).to.equal(400);
        expect(response.body.errorMessage).to.equal('Incorrect form submission');
    });
})