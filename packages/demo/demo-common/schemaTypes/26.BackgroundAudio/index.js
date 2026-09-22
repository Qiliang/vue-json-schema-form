/**
 * BackgroundAudioPreviewWidget demo.
 */
export default {
    schema: {
        title: '背景音试听',
        type: 'object',
        description: 'BackgroundAudioPreviewWidget：选择背景音后点「试听」，请求后端返回音频并播放。<br/>演示环境未接真实接口时按钮可点，请求会失败。',
        properties: {
            sound_files: {
                title: '背景音',
                type: 'string',
                default: 'office-ambience-16000-mono.mp3',
                enum: [
                    'office-ambience-16000-mono.mp3',
                    'office2-ambience-16000-mono.mp3'
                ],
                enumNames: ['办公室背景音一', '办公室背景音二'],
                'ui:widget': 'BackgroundAudioPreviewWidget',
                'ui:action': '/bot/background-audio/preview',
                'ui:btnText': '试听',
                'ui:stopBtnText': '停止',
                'ui:parentFormData': '{{ parentFormData }}'
            },
            volume: {
                title: '音量',
                type: 'number',
                default: 0.5,
                minimum: 0.1,
                maximum: 10,
                multipleOf: 0.1
            }
        }
    },
    formData: {}
};
