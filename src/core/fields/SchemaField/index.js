/**
 * Created by Liu.Jun on 2020/4/20 9:55 下午.
 */

import {
    getUiField, isSelect, resolveHiddenState, omitHiddenWidget
} from '../../../utils/formUtils';
import { nodePath2ClassName } from '../../../utils/vueUtils';
import { lowerCase } from '../../../utils/utils';
import retrieveSchema from '../../../utils/schema/retriev';
import FIELDS_MAP from '../../FIELDS_MAP';
import vueProps from '../props';

export default {
    name: 'SchemaField',
    props: vueProps,
    functional: true,
    render(h, context) {
        const props = context.props;
        const { rootSchema } = props;

        // 目前不支持schema依赖和additionalProperties 展示不需要传递formData
        // const schema = retrieveSchema(props.schema, rootSchema, formData);
        const schema = retrieveSchema(props.schema, rootSchema);

        // 空数据
        if (Object.keys(schema).length === 0) {
            return null;
        }

        const hiddenOptions = {
            schema,
            uiSchema: props.uiSchema,
            curNodePath: props.curNodePath,
            rootFormData: props.rootFormData,
            rootSchema
        };
        // 开发模式：根 schema mode 为 dev，且当前节点 dev_show 为 true 时，把原本隐藏的节点显示出来
        const { hidden: hiddenWidget, revealInDev } = resolveHiddenState(hiddenOptions);
        const renderSchema = revealInDev ? omitHiddenWidget(schema) : schema;
        const renderUiSchema = revealInDev ? omitHiddenWidget(props.uiSchema) : props.uiSchema;

        // 当前参数
        const curProps = {
            ...props,
            schema: renderSchema,
            uiSchema: renderUiSchema
        };

        // 获取节点Ui配置渲染field组件
        const {
            field: fieldComponent,
            fieldProps
        } = getUiField(FIELDS_MAP, curProps);

        const pathClassName = nodePath2ClassName(props.curNodePath);

        if (schema.anyOf && schema.anyOf.length > 0 && !isSelect(schema)) {
            // anyOf
            return h(FIELDS_MAP.anyOf, {
                class: {
                    [`${pathClassName}-anyOf`]: true,
                    fieldItem: true,
                    anyOfField: true,
                    devShowField: revealInDev
                },
                props: curProps
            });
        } if (schema.oneOf && schema.oneOf.length > 0 && !isSelect(schema)) {
            // oneOf
            return h(FIELDS_MAP.oneOf, {
                class: {
                    [`${pathClassName}-oneOf`]: true,
                    fieldItem: true,
                    oneOfField: true,
                    devShowField: revealInDev
                },
                props: curProps
            });
        }
        return (fieldComponent && !hiddenWidget) ? h(fieldComponent, {
            props: {
                ...curProps,
                fieldProps
            },
            class: {
                ...context.data.class,
                [lowerCase(fieldComponent.name) || fieldComponent]: true,
                hiddenWidget,
                devShowField: revealInDev,
                fieldItem: true,
                [pathClassName]: true
            }
        }) : null;
    }
};
