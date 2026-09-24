export default {
    schema: {
        title: '语音高级设置',
        description: '配置仅作用于本次语音调试模拟',
        type: 'object',
        'ui:theme': 'agent',
        'ui:width': '600px',
        properties: {
            device: {
                type: 'object',
                title: '设备与音频处理',
                description: '输入、输出、降噪',
                properties: {
                    input: {
                        type: 'string',
                        title: '声音输入',
                        enum: ['default', 'headset', 'array'],
                        enumNames: ['系统默认麦克风', 'USB 耳麦 · 麦克风', '阵列麦克风 · Realtek'],
                        default: 'default'
                    },
                    output: {
                        type: 'string',
                        title: '声音输出',
                        enum: ['default', 'headset', 'speaker'],
                        enumNames: ['系统默认扬声器', 'USB 耳麦 · 听筒', '桌面扬声器 · Realtek'],
                        default: 'default'
                    },
                    gain: {
                        type: 'number',
                        title: '输入增益',
                        default: 70,
                        minimum: 0,
                        maximum: 100,
                        'ui:widget': 'el-slider'
                    },
                    noiseReduction: {
                        type: 'integer',
                        title: '降噪系数',
                        default: 2,
                        minimum: 0,
                        maximum: 10
                    },
                    enhanced: {
                        type: 'boolean',
                        title: '增强模式',
                        default: true
                    }
                }
            },
            asr: {
                type: 'object',
                title: 'ASR 语音转写',
                description: '火山引擎 STT · 全流式',
                properties: {
                    provider: {
                        type: 'string',
                        title: '服务提供商',
                        enum: ['volcengine', 'aliyun'],
                        enumNames: ['火山引擎 STT', '阿里云智能语音'],
                        default: 'volcengine'
                    },
                    mode: {
                        type: 'string',
                        title: '识别模式',
                        enum: ['stream', 'sentence'],
                        enumNames: ['全流式识别', '句级识别'],
                        default: 'stream',
                        'ui:widget': 'RadioWidget'
                    },
                    hotwords: {
                        type: 'string',
                        title: '热词列表',
                        default: '张江,访客停车',
                        'ui:options': {
                            placeholder: '每个词组使用英文逗号隔开',
                            type: 'textarea',
                            rows: 2
                        }
                    },
                    dynamicHotwords: {
                        type: 'boolean',
                        title: '动态热词',
                        default: false
                    }
                }
            }
        }
    },
    uiSchema: {},
    formData: null
};
