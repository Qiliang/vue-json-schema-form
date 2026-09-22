/**
 * 背景音下拉 + 试听：按当前选中 key 请求后端音频并播放。
 *
 * 需通过 schema / uiSchema 配置：
 * - ui:action 试听接口地址（必填，否则按钮禁用）
 * - ui:btnText 试听按钮文案
 *
 * 请求约定：GET {action}?key={value}，成功时返回 audio/*
 */

function buildPreviewUrl(action, key) {
    const sep = action.indexOf('?') >= 0 ? '&' : '?';
    return `${action}${sep}key=${encodeURIComponent(key)}`;
}

export default {
    name: 'BackgroundAudioPreviewWidget',
    props: {
        value: {
            type: [String, Number],
            default: ''
        },
        enumOptions: {
            type: Array,
            default: () => []
        },
        action: {
            type: String,
            default: ''
        },
        btnText: {
            type: String,
            default: '试听'
        },
        placeholder: {
            type: String,
            default: '请选择'
        }
    },
    data() {
        return {
            loading: false,
            audioUrl: null,
            audio: null
        };
    },
    computed: {
        selectedKey() {
            if (this.value === undefined || this.value === null) {
                return '';
            }
            return String(this.value).trim();
        },
        canPreview() {
            return Boolean(this.action && !this.loading && this.selectedKey);
        }
    },
    watch: {
        value() {
            this.revokeAudio();
        }
    },
    beforeDestroy() {
        this.revokeAudio();
    },
    methods: {
        revokeAudio() {
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }
            if (this.audioUrl) {
                URL.revokeObjectURL(this.audioUrl);
                this.audioUrl = null;
            }
        },
        showError(message) {
            if (this.$message) {
                this.$message.error(message);
            } else {
                // eslint-disable-next-line no-console
                console.error(message);
            }
        },
        parsePreviewError(response, contentType) {
            const fallback = `试听失败 (${response.status})`;
            if (contentType.includes('application/json')) {
                return response.json().then((data) => {
                    if (data && data.detail) {
                        return typeof data.detail === 'string'
                            ? data.detail
                            : JSON.stringify(data.detail);
                    }
                    return fallback;
                });
            }
            return response.text().then(text => (text ? text.slice(0, 200) : fallback));
        },
        handlePreview() {
            if (!this.canPreview) {
                return;
            }

            this.loading = true;
            this.revokeAudio();

            fetch(buildPreviewUrl(this.action, this.selectedKey), {
                method: 'GET'
            }).then((response) => {
                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                if (!response.ok) {
                    return this.parsePreviewError(response, contentType).then((detail) => {
                        throw new Error(detail);
                    });
                }
                if (!contentType.startsWith('audio/')) {
                    throw new Error('试听接口未返回音频');
                }
                return response.blob();
            }).then((blob) => {
                this.audioUrl = URL.createObjectURL(blob);
                this.audio = new Audio(this.audioUrl);
                return this.audio.play();
            }).catch((err) => {
                this.showError((err && err.message) || '试听失败');
            }).then(() => {
                this.loading = false;
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
                    loading: this.loading,
                    disabled: !this.canPreview
                },
                on: {
                    click: this.handlePreview
                }
            }, [this.btnText])
        ]);
    }
};
