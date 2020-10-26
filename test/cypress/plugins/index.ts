// cypress/plugins/index.ts

/// <reference types="cypress" />


import {DatabaseQueries} from "../../../src/common/DatabaseQueries";
import {EnvironmentManager} from "../../../src/common/EnvironmentManager";

const {addMatchImageSnapshotPlugin} = require('cypress-image-snapshot/plugin');
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) =>
{
    on('task', {
        ...DatabaseQueries.databaseTasks,
        ...EnvironmentManager.environmentTasks
    });
    addMatchImageSnapshotPlugin(on, config);
    return config;
}
