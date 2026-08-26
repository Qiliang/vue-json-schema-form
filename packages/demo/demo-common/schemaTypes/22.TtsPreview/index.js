/**
 * Created for TTS preview widget demo.
 */
export default {
    schema: {
        title: 'TTS 试听',
        type: 'object',
        description: 'TtsPreviewWidget：输入试听文本并调用后端合成接口播放。<br/>演示环境未接真实接口时按钮可点，请求会失败。',
        properties: {
            provider: {
                title: '服务提供商',
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        default: 'VolcanoAIV2',
                        'ui:widget': 'HiddenWidget'
                    },
                    voice: {
                        title: '音色',
                        type: 'string',
                        default: 'zh_female_vv_uranus_bigtts',
                        enum: [
                            'zh_female_vv_uranus_bigtts',
                            'zh_male_m191_uranus_bigtts'
                        ],
                        enumNames: ['Vivi 2.0', '云舟 2.0']
                    },
                    speech_rate: {
                        title: '语速',
                        type: 'number',
                        default: 1.2,
                        minimum: 0.5,
                        maximum: 2.0,
                        multipleOf: 0.1
                    }
                }
            },
            preview_text: {
                title: '试听',
                type: 'string',
                default: '你好，欢迎使用智能语音。',
                'ui:widget': 'TtsPreviewWidget',
                'ui:action': '/bot/tts/preview',
                'ui:btnText': '试听',
                'ui:ttsParams': '{{ parentFormData }}',
                'ui:rows': 2
            }
        }
    },
    formData: {}
};
