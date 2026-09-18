module.exports = {
    plugins: [
        require('postcss-import')(),
        require('postcss-mixins'),
        require('postcss-nested'),
        require('postcss-color-mod-function'),
        require('postcss-cssnext')({
            warnForDuplicates: false,
            features: {
                customProperties: {
                    preserve: true,
                    warnings: false
                }
            }
        }),
    ]
};
