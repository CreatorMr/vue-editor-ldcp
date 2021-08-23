import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";


export default defineComponent({
  props: {
    modelValue: { type: Object }
  },
  components: {
    EditorBlock
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newVal) {
        ctx.emit('update:modelValue', deepcopy(newVal))
      }
    });
    console.log(data.value, "container");

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px"
    }));
    console.log(containerStyles, "containerStyles");

    const config = inject("config");

    const containerRef = ref(null);
    // 1.实现拖拽
    const { dragStart, dragEnd } = useMenuDragger(data, containerRef) // 实现菜单的拖拽功能
    // 2\实现获取焦点

    // 3、实现拖拽多个元素的功能

    const clearBlockFocus = () => {
      data.value.blocks.forEach(block => block.focus = false)
    }
    const blockMousedown = (e, block) => {
      console.log('block mousedown')
      e.preventDefault()
      e.stopPropagation()
      // block 上我们规划一个属性 focus获取焦点后就将focus 变为true

      if (e.shiftKey) {
        block.focus = !block.focus
      } else {
        if (!block.focus) {
          clearBlockFocus()
          block.focus = true
        } else {
          block.focus = false
        }
      }

    }
    const focusData = computed(() => {
      let focus = []
      let unfocused = []
      data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
      return {
        focus,
        unfocused
      }

    })
    const containerMousedown = () => {
      console.log('dd')
      clearBlockFocus()
    }
    return () => (
      <div class="editor">
        <div className="editor-left">
          {config.componentList.map(component => (
            <div
              className="editor-left-item"
              draggable
              ondragstart={e => dragStart(e, component)}
              onDragEnd={dragEnd}
            >
              <span>{component.lebel}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div className="editor-top"></div>
        <div className="editor-right"></div>
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
              {data.value.blocks.map(block => (
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  onMousedown={e => blockMousedown(e, block)}
                  block={block}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
});
