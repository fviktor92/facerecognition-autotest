// cypress/plugins/index.ts

/// <reference types="cypress" />

import {ResourceFileReader} from "../../../src/common/ResourceFileReader";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) =>
{
    config.ignoreTestFiles = "**/**/*.js";
    config.experimentalNetworkStubbing = true;

    on('task', {
        readResourceJsonSync(fileName: string)
        {
            let rfr = new ResourceFileReader();
            return rfr.readResourceJsonSync(fileName);
        }
    })

    return config;
}
