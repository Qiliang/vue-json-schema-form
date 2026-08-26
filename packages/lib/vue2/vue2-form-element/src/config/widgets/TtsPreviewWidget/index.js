/**
 * TTS 试听 Widget：输入试听文本，调用后端合成并播放。
 *
 * 需通过 schema / uiSchema 配置：
 * - ui:action 试听接口地址（必填，否则按钮禁用）
 * - ui:ttsParams 当前 TTS 配置对象（可用 {{ parentFormData }}）
 * - ui:providerSchema TTS provider 的 JSON Schema（用于解析显示名；也可由宿主注入）
 * - ui:btnText 试听按钮文案
 * - ui:downloadBtnText 下载按钮文案
 * - ui:rows 大于 1 时使用多行输入
 */

let providerSchemaRef = null;

export function setTtsProviderSchema(schema) {
    providerSchemaRef = schema && typeof schema === 'object' ? schema : null;
}

function guessExt(contentType) {
    if (contentType.includes('wav')) return 'wav';
    if (contentType.includes('mpeg') || contentType.includes('mp3')) return 'mp3';
    if (contentType.includes('ogg')) return 'ogg';
    if (contentType.includes('webm')) return 'webm';
    return 'wav';
}

function sanitizeFilePart(value, fallback = 'unknown') {
    const text = String(value == null ? '' : value)
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, '_');
    return text || fallback;
}

function providerOptions(schema) {
    if (!schema) return [];
    const opts = schema.oneOf || schema.anyOf;
    return Array.isArray(opts) ? opts : [];
}

function matchProviderOption(schema, name) {
    for (const opt of providerOptions(schema)) {
        const nameProp = opt && opt.properties && opt.properties.name;
        const constName = nameProp
            ? (nameProp.const != null
                ? nameProp.const
                : (nameProp.default != null
                    ? nameProp.default
                    : (nameProp.enum && nameProp.enum[0])))
            : undefined;
        if (constName === name) return opt;
    }
    return null;
}

function resolveVoiceLabel(voiceSchema, voiceValue) {
    if (voiceValue == null || voiceValue === '') return 'voice';

    const oneOf = voiceSchema && voiceSchema.oneOf;
    if (Array.isArray(oneOf)) {
        for (const opt of oneOf) {
            if (opt && opt.const === voiceValue && opt.title) {
                return String(opt.title);
            }
        }
    }

    const enums = voiceSchema && voiceSchema.enum;
    const names = voiceSchema && voiceSchema.enumNames;
    if (Array.isArray(enums) && Array.isArray(names)) {
        const idx = enums.indexOf(voiceValue);
        if (idx >= 0 && names[idx]) return String(names[idx]);
    }

    return String(voiceValue);
}

function buildTtsDownloadName(ttsParams, ext, providerSchema) {
    const schema = providerSchema || providerSchemaRef;
    const provider = ttsParams && typeof ttsParams === 'object'
        ? ttsParams.provider
        : undefined;
    const nameVal = provider && provider.name;
    const option = matchProviderOption(schema, nameVal);
    const nameLabel = (option && option.title) || nameVal || 'provider';

    const voiceRaw = provider
        ? (provider.voice && provider.voice.value != null
            ? provider.voice.value
            : provider.voice)
        : undefined;
    const voiceLabel = resolveVoiceLabel(
        option && option.properties && option.properties.voice,
        voiceRaw
    );

    const rateRaw = provider ? provider.speech_rate : undefined;
    const rateLabel = (rateRaw === undefined || rateRaw === null || rateRaw === '')
        ? 'default'
        : String(rateRaw);

    return `${sanitizeFilePart(nameLabel, 'provider')}+${sanitizeFilePart(voiceLabel, 'voice')}+${sanitizeFilePart(rateLabel, 'default')}.${ext}`;
}

export default {
    name: 'TtsPreviewWidget',
    props: {
        value: {
            type: String,
            default: ''
        },
        action: {
            type: String,
            default: ''
        },
        btnText: {
            type: String,
            default: '试听'
        },
        downloadBtnText: {
            type: String,
            default: '下载'
        },
        ttsParams: {
            type: Object,
            default: null
        },
        providerSchema: {
            type: Object,
            default: null
        },
        rows: {
            type: [Number, String],
            default: 1
        },
        placeholder: {
            type: String,
            default: '请输入试听文本'
        }
    },
    data() {
        return {
            loading: false,
            audioUrl: null,
            audio: null,
            downloadName: 'provider+voice+default.wav'
        };
    },
    computed: {
        inputRows() {
            const n = Number(this.rows);
            return Number.isFinite(n) && n > 1 ? n : 1;
        },
        canPreview() {
            return Boolean(
                this.action
                && !this.loading
                && this.value
                && String(this.value).trim()
            );
        },
        canDownload() {
            return Boolean(this.audioUrl) && !this.loading;
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
        handleDownload() {
            if (!this.audioUrl) return;
            const a = document.createElement('a');
            a.href = this.audioUrl;
            a.download = this.downloadName
                || buildTtsDownloadName(this.ttsParams, 'wav', this.providerSchema);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        async handlePreview() {
            if (!this.canPreview) {
                return;
            }
            if (!this.ttsParams || typeof this.ttsParams !== 'object') {
                this.showError('缺少 TTS 配置，无法试听');
                return;
            }

            this.loading = true;
            this.revokeAudio();

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: String(this.value).trim(),
                        tts: this.ttsParams
                    })
                });

                const contentType = (response.headers.get('content-type') || '').toLowerCase();

                if (!response.ok) {
                    let detail = `试听失败 (${response.status})`;
                    if (contentType.includes('application/json')) {
                        const data = await response.json();
                        if (data && data.detail) {
                            detail = typeof data.detail === 'string'
                                ? data.detail
                                : JSON.stringify(data.detail);
                        }
                    } else {
                        const text = await response.text();
                        if (text) detail = text.slice(0, 200);
                    }
                    throw new Error(detail);
                }

                if (!contentType.startsWith('audio/')) {
                    throw new Error('试听接口未返回音频');
                }

                const blob = await response.blob();
                this.downloadName = buildTtsDownloadName(
                    this.ttsParams,
                    guessExt(contentType),
                    this.providerSchema
                );
                this.audioUrl = URL.createObjectURL(blob);
                this.audio = new Audio(this.audioUrl);
                await this.audio.play();
            } catch (err) {
                this.showError((err && err.message) || '试听失败');
            } finally {
                this.loading = false;
            }
        }
    },
    render() {
        const h = this.$createElement;
        const isTextarea = this.inputRows > 1;

        return h('div', {
            style: {
                display: 'flex',
                gap: '8px',
                alignItems: isTextarea ? 'flex-start' : 'center',
                width: '100%'
            }
        }, [
            h('el-input', {
                style: { flex: '1 1 auto' },
                props: {
                    value: this.value,
                    type: isTextarea ? 'textarea' : 'text',
                    rows: this.inputRows,
                    placeholder: this.placeholder,
                    disabled: this.loading
                },
                on: {
                    input: (val) => {
                        this.$emit('input', val);
                    }
                }
            }),
            h('el-button', {
                props: {
                    type: 'primary',
                    loading: this.loading,
                    disabled: !this.canPreview
                },
                on: {
                    click: this.handlePreview
                }
            }, [this.btnText]),
            h('el-button', {
                props: {
                    disabled: !this.canDownload
                },
                on: {
                    click: this.handleDownload
                }
            }, [this.downloadBtnText])
        ]);
    }
};
