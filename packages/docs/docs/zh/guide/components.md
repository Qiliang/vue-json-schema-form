# 全局Widget组件

`Widget` 组件，需要支持v-model双向绑定，通常可以直接使用ui库的输入组件，如 `el-input`，针对一些不能直接使用的场景场景提供如下的内置Widget组件：

> 如下组件在运行时也会在内部直接使用。

* [CheckboxesWidget](#checkboxeswidget)
* [RadioWidget](#radiowidget)
* [SelectWidget](#selectwidget)
* [UploadWidget](#uploadwidget)
* [TtsPreviewWidget](#ttspreviewwidget)
* [TimePickerWidget](#timepickerwidget)
* [DatePickerWidget](#datepickerwidget)
* [DateTimePickerWidget](#datetimepickerwidget)
* [UploadWidget](#uploadwidget)


:::tip
* `vjsf` 在运行中会自动注册如下全局Widget组件。
* [自定义Widget组件参见](/zh/guide/adv-config.html#自定义widget)
:::

## CheckboxesWidget
复选框组，内部使用 elementUi `el-checkbox-group` 组件

### props
* `value/v-model` `required`，类型 [`Array`]
* `enumOptions` `数组` 选项列表，结构如：`[{value: '1',  label: '选项一'}]`，value 为值，label 为显示标签

> 传递其它额外的参数会透传给 `el-checkbox-group` 组件

## RadioWidget
单选框组，内部使用 elementUi `el-radio-group` 组件

### props
* `value/v-model` `required`，类型 [`String`, `Number`, `Boolean`]
* `enumOptions` `数组` 选项列表，结构如：`[{value: '1',  label: '选项一'}]`，value 为值，label 为显示标签

> 传递其它额外的参数会透传给 `el-radio-group` 组件

## SelectWidget
下拉选择，内部使用 elementUi `el-select` 组件

### props
* `value/v-model` `required`，任意类型
* `enumOptions` `数组` 选项列表，结构如：`[{value: '1',  label: '选项一'}]`，value 为值，label 为显示标签

> 传递其它额外的参数会透传给 `el-select` 组件

## UploadWidget
* 文件上传组件，支持多文件上传
* 页面体验地址：[Playground upload 组件](https://form.lljj.me/#/demo?type=Upload)

### props
* `value/v-model` `required`，类型：`[String, Array]`
* `responseFileUrl` Function ，用于处理上传文件接口返回值中提取 url 字段，接受上传接口返回值为参数
* `btnText` 配置上传按钮文字
* `slots` 支持传入 VNode 对象，最终传递给 upload 组件slot，用于自定义上传按钮和提示文案(使用方法参见如下DEMO)

> 传递其它额外的参数会透传给 el-upload 组件

`responseFileUrl` 默认值如下：
```js
{
    responseFileUrl: {
        default: res => (res ? (res.url || (res.data && res.data.url)) : ''),
        type: [Function]
    }
}
```

如下：使用 `ui:slots` 重置上传按钮

::: demo
```html
<template>
    <vue-form
        v-model="formData"
        :schema="schema"
    >
    </vue-form>
</template>

<script>
export default {
    name: 'Demo',
    data() {
        return {
            schema: {
                title: '文件上传',
                type: 'object',
                description: '文件上传 使用 el-upload组件，支持所有的 el-upload 参数，<br/>slot 可以通过 slots参数传入数组VNode list',
                properties: {
                    imgUrl: {
                        title: '单个图片',
                        type: 'string',
                        default: 'http://img.alicdn.com/tfs/TB1vYlkdnZmx1VjSZFGXXax2XXa-468-644.jpg_320x5000q100.jpg_.webp',
                        'ui:action': 'https://run.mocky.io/v3/518d7af7-204f-45ab-9628-a6e121dab8ca',
                        'ui:widget': 'UploadWidget',
                        'ui:slots': {
                            default(h) {
                                return h('el-button', {
                                    slot: 'default',
                                    props: {
                                        size: 'mini',
                                        type: 'primary'
                                    },
                                }, ['上传图片'])
                            },
                            tip(h) {
                                return h('div', {
                                    slot: 'tip',
                                    style: {
                                        fontSize: '12px',
                                        color: '#666'
                                    }
                                }, ['注：请上传100 * 100尺寸的图片'])
                            },
                       }
                    },
                    imgUrlList: {
                        title: '多图',
                        type: 'array',
                        'ui:action': 'https://run.mocky.io/v3/518d7af7-204f-45ab-9628-a6e121dab8ca',
                        'ui:btnText': '重新设置上传按钮文字',
                        'ui:widget': 'UploadWidget',
                        // eslint-disable-next-line max-len
                        default: ['http://img.alicdn.com/tfs/TB1vYlkdnZmx1VjSZFGXXax2XXa-468-644.jpg_320x5000q100.jpg_.webp'],
                        items: {
                            type: 'string',
                        }
                    }
                }
            },
            formData: {}
       }
    }
};
</script>
```
:::

## TtsPreviewWidget
* TTS 试听组件：输入试听文本，调用后端合成接口并播放音频
* 页面体验地址：[Playground TtsPreview 组件](https://form.lljj.me/#/demo?type=TtsPreview)

### props
* `value/v-model` `required`，类型：`String`，试听文本
* `action` 试听接口地址；未配置时按钮禁用
* `ttsParams` 当前 TTS 配置对象，会作为请求体中的 `tts` 字段提交
* `btnText` 试听按钮文案，默认 `试听`
* `rows` 大于 1 时使用多行输入
* `placeholder` 输入框占位文案

请求约定：
```http
POST {action}
Content-Type: application/json

{ "text": "<试听文本>", "tts": <ttsParams> }
```
成功时接口应返回 `audio/*`（推荐 `audio/wav`）。

schema 中可直接配置（也可用 uiSchema）：
```js
{
  preview_text: {
    type: 'string',
    title: '试听',
    default: '你好，欢迎使用智能语音。',
    'ui:widget': 'TtsPreviewWidget',
    'ui:action': '/bot/tts/preview',
    'ui:btnText': '试听',
    // 将父对象（TTS 配置）传给 widget
    'ui:ttsParams': '{{ parentFormData }}',
    'ui:rows': 2
  }
}
```

## TimePickerWidget
> 内部使用 `timPick` 组件，支持参数透传

## DatePickerWidget
> 内部使用 `DatePicker / DateTimePicker` 组件，支持参数透传

## DateTimePickerWidget
> 内部使用 `DatePicker / DateTimePicker` 组件，支持参数透传
