import {ResourceFileReader} from "./ResourceFileReader";
import {Pool, PoolConfig} from "pg";

const ENVIRONMENT: string = process.env.ENV!;
const DB_CONFIG_FILENAME: string = 'database_config.json';

const TEST_ENV_CONFIG_FILENAME: string = 'test_environments.json';
const API_HOST_ATTRIBUTE: string = 'apiHost';
const CLIENT_HOST_ATTRIBUTE: string = 'clientHost';

/**
 * Contains vital information about the current environment where the tests are being executed.
 */
export class EnvironmentManager
{
    private static ENV_CONFIG: { [i: string]: object } = ResourceFileReader.readResourceJsonSync(TEST_ENV_CONFIG_FILENAME);
    private static DB_CONFIG: { [i: string]: object } = ResourceFileReader.readResourceJsonSync(DB_CONFIG_FILENAME);

    // For Cypress
    static environmentTasks = {
        getApiBaseUrl(): string
        {
            return EnvironmentManager.getApiBaseUrl();
        },
        getClientBaseUrl(): string
        {
            return EnvironmentManager.getClientBaseUrl();
        },
        getEnvironmentConfig(): { [i: string]: any }
        {
            return EnvironmentManager.getEnvironmentConfig();
        }
    }

    /**
     *
     * @returns {PoolConfig} Information about the database configuration.
     */
    static getDatabaseConfig(): PoolConfig
    {
        return this.DB_CONFIG[ENVIRONMENT];
    }

    /**
     *
     * @returns {string} The base url of the api. E.g.: 'http://localhost:3001'
     */
    static getApiBaseUrl(): string
    {
        return EnvironmentManager.getEnvironmentConfig()[API_HOST_ATTRIBUTE];
    }

    /**
     *
     * @returns {string} The base url of the client. E.g.: 'http://localhost:3000'
     */
    static getClientBaseUrl(): string
    {
        return EnvironmentManager.getEnvironmentConfig()[CLIENT_HOST_ATTRIBUTE];
    }

    /**
     *
     * @returns {{[p: string]: any}} Information about the environment configuration.
     */
    static getEnvironmentConfig(): { [i: string]: any }
    {
        return this.ENV_CONFIG[ENVIRONMENT];
    }
}