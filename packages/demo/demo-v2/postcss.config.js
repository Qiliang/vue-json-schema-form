module.exports = {
    plugins: [
        require('postcss-import')(),
        require('postcss-mixins'),
        require('postcss-nested'),
        require('postcss-color-mod-function'),
        require('postcss-cssnext')({
            warnForDuplicates: false,
            features: {
                // 保留 var(--vjsf-label-color) 等运行时变量，否则会被编译成 fallback 色值
                customProperties: {
                    preserve: true,
                    warnings: false
                }
            }
        }),
    ]
};
