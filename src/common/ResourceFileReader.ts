const path = require('path');
const fs = require('fs');

export class ResourceFileReader
{
    static readResourceJsonSync(fileName: string): { [index: string]: any }
    {
        let resourcePath: string = path.join(__dirname, '../../', 'resources', fileName);
        let data: string = fs.readFileSync(resourcePath, "utf-8");
        return JSON.parse(data);
    }
}