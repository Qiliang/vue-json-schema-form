<template>
    <div class="fieldGroupWrap">
        <h3
            v-if="showTitle && trueTitle"
            class="fieldGroupWrap_title"
            :style="titleStyle"
        >
            {{ trueTitle }}
        </h3>
        <p
            v-if="showDescription && description"
            class="fieldGroupWrap_des"
            :style="desStyle"
            v-html="description"
        >
        </p>
        <div class="fieldGroupWrap_box">
            <slot></slot>
        </div>
    </div>
</template>

<script>
function resolveUiColor(fieldColor, formColor) {
    if (fieldColor != null && fieldColor !== '') return fieldColor;
    if (formColor != null && formColor !== '') return formColor;
    return undefined;
}

export default {
    name: 'FieldGroupWrap',
    inject: ['genFormProvide'],
    props: {
        // 当前节点路径
        curNodePath: {
            type: String,
            default: ''
        },
        showTitle: {
            type: Boolean,
            default: true
        },
        showDescription: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        labelColor: {
            type: String,
            default: undefined
        },
        descriptionColor: {
            type: String,
            default: undefined
        },
        formProps: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        trueTitle() {
            const title = this.title;
            if (title) {
                return title;
            }

            let fallbackLabel;
            if (typeof this.genFormProvide.fallbackLabel?.value === 'boolean') {
                fallbackLabel = this.genFormProvide.fallbackLabel?.value;
            } else {
                fallbackLabel = this.genFormProvide.fallbackLabel;
            }
            const backTitle = fallbackLabel && this.curNodePath.split('.').pop();
            if (backTitle !== `${Number(backTitle)}`) return backTitle;

            return '';
        },
        titleStyle() {
            const color = resolveUiColor(this.labelColor, this.formProps && this.formProps.labelColor);
            return color ? { color } : undefined;
        },
        desStyle() {
            const color = resolveUiColor(this.descriptionColor, this.formProps && this.formProps.descriptionColor);
            return color ? { color } : undefined;
        }
    }
};
</script>
