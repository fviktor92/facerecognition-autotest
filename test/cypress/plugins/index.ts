// cypress/plugins/index.ts

/// <reference types="cypress" />


import {DatabaseQueries} from "../../../src/common/DatabaseQueries";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) =>
{
    config.ignoreTestFiles = "**/**/*.js";
    config.experimentalNetworkStubbing = true;

    on('task', {
        ...DatabaseQueries.databaseTasks
    });
    return config;
}
