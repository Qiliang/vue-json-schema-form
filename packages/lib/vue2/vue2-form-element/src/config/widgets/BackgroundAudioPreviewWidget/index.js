/**
 * 背景音下拉 + 试听：按当前选中 key 请求后端音频并播放。
 *
 * 需通过 schema / uiSchema 配置：
 * - ui:action 试听接口地址（必填，否则按钮禁用）
 * - ui:parentFormData 当前父级表单（读 volume，可用 {{ parentFormData }}）
 * - ui:btnText 试听按钮文案
 * - ui:stopBtnText 播放中停止按钮文案
 *
 * 请求约定：GET {action}?key={value}，成功时返回 audio/*
 */

function buildPreviewUrl(action, key) {
    const sep = action.indexOf('?') >= 0 ? '&' : '?';
    return `${action}${sep}key=${encodeURIComponent(key)}`;
}

function isAbortError(err) {
    return Boolean(err && (err.name === 'AbortError' || err.code === 20));
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function getAudioContextCtor() {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.AudioContext || window.webkitAudioContext || null;
}

function resumeAudioContext(ctx) {
    if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        return ctx.resume();
    }
    return Promise.resolve();
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
        stopBtnText: {
            type: String,
            default: '停止'
        },
        placeholder: {
            type: String,
            default: '请选择'
        },
        parentFormData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            loading: false,
            playing: false,
            audioUrl: null,
            audio: null,
            abortController: null,
            audioContext: null,
            mediaSource: null,
            gainNode: null
        };
    },
    computed: {
        selectedKey() {
            if (this.value === undefined || this.value === null) {
                return '';
            }
            return String(this.value).trim();
        },
        currentVolume() {
            const raw = this.parentFormData && this.parentFormData.volume;
            const n = Number(raw);
            if (!Number.isFinite(n)) {
                return 1;
            }
            return Math.max(0, n);
        },
        currentBtnText() {
            return this.playing ? this.stopBtnText : this.btnText;
        },
        canStart() {
            return Boolean(this.action && !this.loading && !this.playing && this.selectedKey);
        }
    },
    watch: {
        value() {
            this.stopPreview();
        },
        currentVolume() {
            this.applyVolume();
        }
    },
    beforeDestroy() {
        this.stopPreview();
        if (this.audioContext && typeof this.audioContext.close === 'function') {
            this.audioContext.close();
            this.audioContext = null;
        }
    },
    methods: {
        bindAudioEvents(audio) {
            audio.addEventListener('ended', this.onAudioEnded);
            audio.addEventListener('pause', this.onAudioPause);
        },
        unbindAudioEvents(audio) {
            audio.removeEventListener('ended', this.onAudioEnded);
            audio.removeEventListener('pause', this.onAudioPause);
        },
        disconnectGain() {
            if (this.mediaSource) {
                try {
                    this.mediaSource.disconnect();
                } catch (e) {
                    // ignore
                }
                this.mediaSource = null;
            }
            if (this.gainNode) {
                try {
                    this.gainNode.disconnect();
                } catch (e) {
                    // ignore
                }
                this.gainNode = null;
            }
        },
        applyVolume() {
            if (this.gainNode) {
                this.gainNode.gain.value = this.currentVolume;
                if (this.audio) {
                    this.audio.volume = 1;
                }
                return;
            }
            if (this.audio) {
                this.audio.volume = clamp01(this.currentVolume);
            }
        },
        connectGain(audio) {
            const Ctx = getAudioContextCtor();
            if (!Ctx) {
                this.applyVolume();
                return Promise.resolve();
            }
            if (!this.audioContext) {
                this.audioContext = new Ctx();
            }
            this.disconnectGain();
            audio.volume = 1;
            this.mediaSource = this.audioContext.createMediaElementSource(audio);
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.currentVolume;
            this.mediaSource.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            return resumeAudioContext(this.audioContext);
        },
        revokeAudio() {
            if (this.audio) {
                this.unbindAudioEvents(this.audio);
                this.audio.pause();
                this.audio = null;
            }
            this.disconnectGain();
            if (this.audioUrl) {
                URL.revokeObjectURL(this.audioUrl);
                this.audioUrl = null;
            }
            this.playing = false;
        },
        abortRequest() {
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
        },
        stopPreview() {
            this.abortRequest();
            this.revokeAudio();
            this.loading = false;
        },
        onAudioEnded() {
            this.playing = false;
            this.revokeAudio();
        },
        onAudioPause() {
            if (this.audio && this.audio.ended) {
                return;
            }
            this.playing = false;
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
        handleClick() {
            if (this.playing) {
                this.stopPreview();
                return;
            }
            this.handlePreview();
        },
        handlePreview() {
            if (!this.canStart) {
                return;
            }

            this.stopPreview();
            this.loading = true;

            const controller = typeof AbortController !== 'undefined'
                ? new AbortController()
                : null;
            this.abortController = controller;
            const request = controller
                ? { method: 'GET', signal: controller.signal }
                : { method: 'GET' };

            fetch(buildPreviewUrl(this.action, this.selectedKey), request).then((response) => {
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
                if (controller && this.abortController !== controller) {
                    return null;
                }
                this.audioUrl = URL.createObjectURL(blob);
                this.audio = new Audio(this.audioUrl);
                this.bindAudioEvents(this.audio);
                return this.connectGain(this.audio).then(() => {
                    if (!this.audio) {
                        return null;
                    }
                    return this.audio.play();
                }).then(() => {
                    if (this.audio) {
                        this.playing = true;
                    }
                });
            }).catch((err) => {
                if (isAbortError(err)) {
                    return;
                }
                this.showError((err && err.message) || '试听失败');
                this.playing = false;
            }).then(() => {
                if (!controller || this.abortController === controller) {
                    this.loading = false;
                    this.abortController = null;
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
                    type: this.playing ? 'default' : 'primary',
                    loading: this.loading,
                    disabled: !this.playing && !this.canStart
                },
                on: {
                    click: this.handleClick
                }
            }, [this.currentBtnText])
        ]);
    }
};
