const path = require('path');

const resolve = p => path.resolve(__dirname, '../', p);

const packageData = require('../package.json');

const banner = `/** @license ${packageData.name} v${packageData.version} (c) 2020-${new Date().getFullYear()} ${packageData.author} License: ${packageData.license} */`;

module.exports = {
    entry: resolve('src/index.js'),
    banner,
    external: ['vue'],
    globals: {
        vue: 'Vue'
    },
    extractcss: false,
    output: {
        path: resolve('dist/'),
        file: 'vueJsonSchemaForm',
        name: 'vueJsonSchemaForm',
        format: ['esm', 'umd']
    }
};
