const fs = require('fs');
const path = require('path');

const readPackageConfig = () => {
    const { config } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    return config;
};
const getRuntimeVersion = runtime => {
    if (!runtime.indexOf('nodejs') === -1) {
        throw new Error('Invalid runtime version');
    }
    const version = runtime.replace(/nodejs([0-9]+)\..*$/, '$1');
    return parseInt(version, 10);
};

module.exports = {
    readPackageConfig,
    getRuntimeVersion
};
