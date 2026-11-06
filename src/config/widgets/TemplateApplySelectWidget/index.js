/**
 * 模版下拉 + 「应用模版」按钮：按 schema 中的 fillByKey 回填兄弟字段。
 *
 * 需通过 schema / uiSchema 配置：
 * - ui:fillByKey 各选项对应的回填对象，如 { qingyun_cs: { system_prompt, probability, temperature } }
 * - ui:fillFields 要点击后写入的字段名列表
 * - ui:parentFormData 当前父级表单对象（可用 {{ parentFormData }}）
 * - ui:btnText 按钮文案
 */

export default {
    name: 'TemplateApplySelectWidget',
    props: {
        value: {
            type: [String, Number],
            default: ''
        },
        enumOptions: {
            type: Array,
            default: () => []
        },
        fillByKey: {
            type: Object,
            default: () => ({})
        },
        fillFields: {
            type: Array,
            default: () => []
        },
        parentFormData: {
            type: Object,
            default: null
        },
        btnText: {
            type: String,
            default: '应用模版'
        },
        placeholder: {
            type: String,
            default: '请选择'
        }
    },
    computed: {
        currentPayload() {
            if (!this.fillByKey || this.value === undefined || this.value === null) {
                return {};
            }
            const payload = this.fillByKey[this.value];
            return payload && typeof payload === 'object' ? payload : {};
        },
        canApply() {
            if (!this.parentFormData || !this.fillFields || !this.fillFields.length) {
                return false;
            }
            return this.fillFields.some(field => this.currentPayload[field] !== undefined);
        }
    },
    methods: {
        handleApply() {
            if (!this.canApply) return;
            this.fillFields.forEach((field) => {
                if (this.currentPayload[field] !== undefined) {
                    this.$set(this.parentFormData, field, this.currentPayload[field]);
                }
            });
        }
    },
    render() {
        const h = this.$createElement;

        return h('div', {
            style: {
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                width: '100%'
            }
        }, [
            h('el-select', {
                style: { flex: '1 1 auto' },
                props: {
                    value: this.value,
                    placeholder: this.placeholder
                },
                on: {
                    input: val => this.$emit('input', val)
                }
            }, (this.enumOptions || []).map((item, index) => h('el-option', {
                key: index,
                props: {
                    label: item.label,
                    value: item.value
                }
            }))),
            h('el-button', {
                props: {
                    type: 'primary',
                    disabled: !this.canApply
                },
                on: {
                    click: this.handleApply
                }
            }, [this.btnText])
        ]);
    }
};
