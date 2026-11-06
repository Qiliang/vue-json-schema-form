const rollup = require('rollup');

const baseConfig = require('./base.config');

const buildConfig = baseConfig({
    sourcemap: false,
    uglify: true
});

const { output: outputList, ...inputOptions } = buildConfig;

async function build() {
    const bundle = await rollup.rollup(inputOptions);

    for (const outputOptions of outputList) {
        // eslint-disable-next-line no-await-in-loop
        await bundle.write(outputOptions);
        console.log(`Success: ${outputOptions.file}`);
    }
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
