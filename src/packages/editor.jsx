import { computed, defineComponent, inject, ref } from 'vue'
import './editor.scss'
import EditorBlock from './editor-block'
import deepcopy from 'deepcopy'
import { useMenuDragger } from './useMenuDragger'
import { useFocus } from './useFocus'
import { useBlockDragger } from './useBlockDragger'
import { useCommand } from './useCommand'

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  components: {
    EditorBlock,
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newVal) {
        ctx.emit('update:modelValue', deepcopy(newVal))
      },
    })
    console.log(data.value, 'container')

    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px',
    }))
    console.log(containerStyles, 'containerStyles')

    const config = inject('config')

    const containerRef = ref(null)
    // 1.实现拖拽
    const { dragStart, dragEnd } = useMenuDragger(data, containerRef) // 实现菜单的拖拽功能
    // 2\实现获取焦点, 选中可能直接拖拽

    const {
      containerMousedown,
      blockMousedown,
      focusData,
      lastSelectBlock,
    } = useFocus(data, (e) => {
      mousedown(e)
    })

    // 3、实现拖拽多个元素的功能
    const { mousedown, markLine } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data,
    )

    // header 按钮
    const { commands } = useCommand(data)

    const buttons = [
      {
        label: '撤销',
        icon: 'icon-back',
        handler: () => commands.undo(),
      },
      {
        label: '重做',
        icon: 'icon-forward',
        handler: () => commands.redo(),
      },
    ]

    return () => (
      <div class="editor">
        <div className="editor-left">
          {config.componentList.map((component) => (
            <div
              className="editor-left-item"
              draggable
              ondragstart={(e) => dragStart(e, component)}
              ondragend={dragEnd}
            >
              <span>{component.lebel}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div className="editor-top">
          {buttons.map((btn) => (
            <div class="editor-top-button" onClick={btn.handler}>
              <i class={btn.icon}></i>
              <span>{btn.label}</span>
            </div>
          ))}
        </div>
        <div className="editor-right">属性配置</div>
        <div className="editor-container">
          {/* 负责产生滚动条 */}
          <div className="editor-container-canvas">
            {/* 产生内容区域 */}
            <div
              className="editor-container-canvas__content"
              style={containerStyles.value}
              ref={containerRef}
              onmousedown={containerMousedown}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                  block={block}
                />
              ))}
              {markLine.x !== null && (
                <div class="line-x" style={{ left: markLine.x + 'px' }}></div>
              )}
              {markLine.y !== null && (
                <div class="line-y" style={{ top: markLine.y + 'px' }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
})
