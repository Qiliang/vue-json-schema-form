const path = require('path');
const rollup = require('rollup');
const baseConfig = require('./base.config');

const resolve = p => path.resolve(__dirname, '../', p);

const watchConfig = baseConfig({
    sourcemap: true
});

const watcher = rollup.watch({
    ...watchConfig,
    watch: {
        buildDelay: 300,
        include: resolve('src/**'),
        exclude: resolve('node_modules/**'),
        clearScreen: true
    }
});

watcher.on('event', (event) => {
    console.log(`Watch Event Code: ${event.code}`);
    if (event.code === 'ERROR') {
        console.error(event.error);
    }
});
