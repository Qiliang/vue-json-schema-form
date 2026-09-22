/**
 * TemplateApplySelectWidget demo.
 */
export default {
    schema: {
        title: '应用模版',
        type: 'object',
        description: 'TemplateApplySelectWidget：选择模版后点「应用模版」，按 ui:fillByKey 回填兄弟字段。读不到模版时仅有「空」，按钮禁用。',
        properties: {
            template: {
                title: '模版选择',
                type: 'string',
                default: '',
                enum: ['', 'qingyun_cs', 'brief_ack'],
                enumNames: ['空', '青云客服垫词', '简短确认（测试）'],
                'ui:widget': 'TemplateApplySelectWidget',
                'ui:btnText': '应用模版',
                'ui:parentFormData': '{{ parentFormData }}',
                'ui:fillFields': ['system_prompt', 'probability', 'temperature'],
                'ui:fillByKey': {
                    '': {},
                    qingyun_cs: {
                        system_prompt: '你是电话语音助手的垫话模块。根据用户最新一句话，立刻回一句口语垫词。',
                        probability: 0.7,
                        temperature: 1.0
                    },
                    brief_ack: {
                        system_prompt: '只输出 3 到 10 个字的确认垫词，以逗号或句号结束。',
                        probability: 0.4,
                        temperature: 0.5
                    }
                }
            },
            probability: {
                title: '垫词概率',
                type: 'number',
                default: 0.7,
                minimum: 0,
                maximum: 1,
                multipleOf: 0.01
            },
            temperature: {
                title: '温度',
                type: 'number',
                default: 1.0,
                minimum: 0,
                maximum: 2,
                multipleOf: 0.1
            },
            system_prompt: {
                title: '垫词系统提示词',
                type: 'string',
                default: '',
                'ui:type': 'textarea',
                'ui:rows': 8
            }
        }
    },
    formData: {}
};
