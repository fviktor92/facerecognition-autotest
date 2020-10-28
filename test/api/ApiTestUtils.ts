import {SuperTest} from "supertest";
import {EnvironmentManager} from "../../src/common/EnvironmentManager";
import {SuperAgentRequest} from "superagent";
import {ApiPaths} from "../cypress/support/paths/ApiPaths";
import {Response} from "supertest";
import {User} from "../../src/objects/User";

export const expect = require('chai').expect;

export const getSuperTest = (token?: string): SuperTest<SuperAgentRequest> =>
{
    const superTest = require('supertest')(EnvironmentManager.getApiBaseUrl());
    return (token) ? superTest.set('Authorization', token) : superTest;
}

export const authenticateAsUser = async (user: string | User): Promise<string> =>
{
    return await getSuperTest()
        .post(ApiPaths.SIGNIN_PATH)
        .send(user)
        .then((res: Response) =>
        {
            expect(res.status).to.equal(200);
            return res.body.token;
        });
}