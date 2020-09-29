const path = require('path');
const fs = require('fs');

export class ResourceFileReader
{
    readResourceJsonSync(fileName: string): { [index: string]: any }
    {
        let resourcePath: string = path.join(__dirname, '../../', 'resources', fileName);
        let data: string = fs.readFileSync(resourcePath, "utf-8");
        return JSON.parse(data);
    }
}