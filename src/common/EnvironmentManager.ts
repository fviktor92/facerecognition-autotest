import {ResourceFileReader} from "./ResourceFileReader";
import {PoolConfig} from "pg";

const ENVIRONMENT: string = process.env.ENV!;
const DB_CONFIG_FILENAME: string = 'database_config.json';

export class EnvironmentManager
{
    static getDatabaseConfig(): PoolConfig
    {
        let data: { [p: string]: any } = ResourceFileReader.readResourceJsonSync(DB_CONFIG_FILENAME);
        return data[ENVIRONMENT];
    }

}