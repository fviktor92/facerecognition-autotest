import {ResourceFileReader} from "./ResourceFileReader";
import {Pool, PoolConfig} from "pg";

const ENVIRONMENT: string = process.env.ENV!;
const DB_CONFIG_FILENAME: string = 'database_config.json';

const TEST_ENV_CONFIG_FILENAME: string = 'test_environments.json';
const API_HOST_ATTRIBUTE: string = 'apiHost';
const CLIENT_HOST_ATTRIBUTE: string = 'clientHost';

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


    static getDatabaseConfig(): PoolConfig
    {
        return this.DB_CONFIG[ENVIRONMENT];
    }

    static getApiBaseUrl(): string
    {
        return EnvironmentManager.getEnvironmentConfig()[API_HOST_ATTRIBUTE];
    }

    static getClientBaseUrl(): string
    {
        return EnvironmentManager.getEnvironmentConfig()[CLIENT_HOST_ATTRIBUTE];
    }

    static getEnvironmentConfig(): { [i: string]: any }
    {
        return this.ENV_CONFIG[ENVIRONMENT];
    }
}