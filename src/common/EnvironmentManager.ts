import {ResourceFileReader} from "./ResourceFileReader";

const ENVIRONMENT: string = process.env.ENV!;
const DB_CONFIG_FILENAME: string = 'database_config.json';

export class EnvironmentManager
{
    static initialized: boolean = false;
    static resourceFileReader: ResourceFileReader;
    static dbConfig: Object;

    static initialize()
    {
        if (!this.initialized)
        {
            this.readConfigurationFiles();
            this.initialized = true;
        }
    }

    static readConfigurationFiles()
    {
        this.resourceFileReader = new ResourceFileReader();
        let data: { [p: string]: any } = this.resourceFileReader.readResourceJsonSync(DB_CONFIG_FILENAME);
        this.dbConfig = data[ENVIRONMENT];
        console.log(this.dbConfig);
    }
}