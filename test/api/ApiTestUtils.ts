import {Response, SuperTest} from "supertest";
import {EnvironmentManager} from "../../src/common/EnvironmentManager";
import {SuperAgentRequest} from "superagent";
import {ApiPaths} from "../cypress/support/paths/ApiPaths";
import {User} from "../../src/objects/User";

export const expect = require('chai').expect;

export const getSuperTest = (): SuperTest<SuperAgentRequest> =>
{
    return require('supertest')(EnvironmentManager.getApiBaseUrl());
};

/**
 * @param {string | User} user
 * @returns {Promise<object>} Authorization header object with a JWT value.
 * @example
 *   let authorizationHeader = await authenticateAsUser(username);
 *   getSuperTest().get(url).set(authorizationHeader);
 */
export const authenticateAsUser = async (user: string | User): Promise<object> =>
{
    return await getSuperTest()
        .post(ApiPaths.SIGNIN_PATH)
        .send(user)
        .then((res: Response) =>
        {
            expect(res.status).to.equal(200);
            return {Authorization: res.body.token};
        });
};