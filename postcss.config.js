/* eslint-disable global-require */

module.exports = {
    plugins: [
        require('postcss-import')({
            path: ['src/common/css/'],
        }),
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
        require('cssnano')({
            sourcemap: false,
            autoprefixer: false,
            safe: true,
            discardComments: {
                removeAll: true,
            },
            discardUnused: false,
            zindex: false,
        }),
    ]
};
