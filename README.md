# @xiaoql/vue2-form-element

基于 Vue2、[ElementUI](https://element.eleme.io/)、[JSON Schema](https://json-schema.org/understanding-json-schema/index.html) 生成带完整校验的表单。

## 安装

```bash
npm install @xiaoql/vue2-form-element vue@2 element-ui
```

`vue` 和 `element-ui` 是 peer dependency，需要由业务项目安装。

## 使用

```html
<VueForm
    v-model="formData"
    :schema="schema"
>
</VueForm>
```

```js
import VueForm from '@xiaoql/vue2-form-element';

export default {
    name: 'Demo',
    components: {
        VueForm
    },
    data() {
        return {
            formData: {},
            schema: {
                type: 'object',
                required: ['userName'],
                properties: {
                    userName: {
                        type: 'string',
                        title: '用户名',
                        default: 'Liu.Jun'
                    }
                }
            }
        };
    }
};
```

页面中需要先引入 ElementUI。浏览器直接使用 UMD 时，全局变量名为 `vueJsonSchemaForm`。

## CDN 验证页

先构建，再启动静态服务：

```bash
yarn build
yarn demo
```

打开 [http://127.0.0.1:4173/demo/](http://127.0.0.1:4173/demo/)。页面通过 jsDelivr 引入 Vue 2 和 Element UI，再用 script 标签引入 `dist/vueJsonSchemaForm.umd.min.js`。发布后可以把该地址换成：

```html
<script src="https://cdn.jsdelivr.net/npm/@xiaoql/vue2-form-element/dist/vueJsonSchemaForm.umd.min.js"></script>
```

## 本地构建

```bash
yarn install
yarn build
```

产物在 `dist/`，类型声明在 `types/`。

## License

Apache-2.0
