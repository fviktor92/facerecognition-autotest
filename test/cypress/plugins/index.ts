// cypress/plugins/index.ts

/// <reference types="cypress" />


import {DatabaseQueries} from "../../../src/common/DatabaseQueries";
import {QueryResult, QueryResultRow} from "pg";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) =>
{
    config.ignoreTestFiles = "**/**/*.js";
    config.experimentalNetworkStubbing = true;

    on('task', {
        queryUserByEmail(email: string): Promise<QueryResultRow>
        {
            return DatabaseQueries.getUserByEmail(email);
        },

        queryLoginByEmail(email: string): Promise<QueryResultRow>
        {
            return DatabaseQueries.getLoginByEmail(email);
        }

    });
    return config;
}
