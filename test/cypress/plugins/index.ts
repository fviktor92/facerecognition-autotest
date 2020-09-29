// cypress/plugins/index.ts

/// <reference types="cypress" />


import {EnvironmentManager} from "../../../src/common/EnvironmentManager";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) =>
{
    config.ignoreTestFiles = "**/**/*.js";
    config.experimentalNetworkStubbing = true;

    on('task', {
        initEnvironment()
        {
            EnvironmentManager.initialize();
            return null;
        }
    })

    return config;
}
