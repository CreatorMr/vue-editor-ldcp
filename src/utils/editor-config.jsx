// 列表区，可以显示所有的物料
// key对应的组件映射关系

import { ElButton, ElInput } from 'element-plus'

function createEditorConfig() {
  const componentList = []

  const componentMap = {}

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component)
      componentMap[component.key] = component
    },
  }
}

export let registerConfig = createEditorConfig()
registerConfig.register({
  lebel: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text',
})
registerConfig.register({
  lebel: '按钮',
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染文本</ElButton>,
  key: 'button',
})
registerConfig.register({
  lebel: 'Input',
  preview: () => <ElInput placeholder="预览输入"></ElInput>,
  render: () => <ElInput placeholder="渲染输入"></ElInput>,
  key: 'input',
})
