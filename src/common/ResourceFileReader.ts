const path = require('path');

export class ResourceFileReader
{
    /**
     * Reads a JSON config file from resources that's essential for the working of the test framework.
     * @param {string} fileName Must start with 'config_'!
     * @returns {{[p: string]: object}}
     */
    static readConfigJsonSync(fileName: string): { [index: string]: object }
    {
        if (!fileName.startsWith('config_'))
        {
            throw new Error('The file name must start with "config_"!');
        }
        let resourcePath: string = path.join(__dirname, '../../', 'resources', fileName);
        return require(resourcePath);
    }

    /**
     * Reads a JSON resource file.
     * @param {string} fileName
     * @returns {JSON}
     */
    static readResourceJsonSync(fileName: string)
    {
        let resourcePath: string = path.join(__dirname, '../../', 'resources', fileName);
        return require(resourcePath);
    }

    /**
     * Reads a JSON test-resource file.
     * @param {string} fileName
     * @returns {JSON}
     */
    static readTestResourceJsonSync(fileName: string)
    {
        let resourcePath: string = path.join(__dirname, '../../', 'test-resources', fileName);
        return require(resourcePath);
    }
}