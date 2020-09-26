const path = require('path');
const fs = require('fs');

export class ResourceFileReader
{
    readResourceJsonSync(fileName: string): JSON
    {
        let resourcePath: string = path.join(__dirname, '../../', 'resources', fileName);
        console.log(resourcePath);
        let data: string = fs.readFileSync(resourcePath, "utf-8");
        let json: JSON = JSON.parse(data);
        console.log(json);
        return json;
    }
}