const path = require('path');

export class ResourceFileReader
{
    static readResourceJsonSync(fileName: string): { [index: string]: object }
    {
        let resourcePath: string = path.join(__dirname, '../../', 'resources', fileName);
        return require(resourcePath);
    }

    static readTestResourceJsonSync(fileName: string): { [index: string]: object }
    {
        let resourcePath: string = path.join(__dirname, '../../', 'test-resources', fileName);
        return require(resourcePath);
    }
}