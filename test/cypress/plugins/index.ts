// cypress/plugins/index.ts

/// <reference types="cypress" />


import {DatabaseQueries} from "../../../src/common/DatabaseQueries";
import {EnvironmentManager} from "../../../src/common/EnvironmentManager";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) =>
{
    config.ignoreTestFiles = "**/**/*.js";
    config.experimentalNetworkStubbing = true;

    on('task', {
        ...DatabaseQueries.databaseTasks,
        ...EnvironmentManager.environmentTasks
    });
    return config;
}
