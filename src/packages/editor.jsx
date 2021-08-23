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
    const {dragStart, dragEnd} = useMenuDragger(data, containerRef) // 实现菜单的拖拽功能

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
            >
              {data.value.blocks.map(block => (
                <EditorBlock block={block} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
});
