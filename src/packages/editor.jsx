import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";

import deepcopy from "deepcopy";
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
    let currentComponent = null;
    const dragenter = e => {
      e.dataTransfer.dropEffect = "move";
      console.log("dsd");
    };
    const dragover = e => {
      e.preventDefault();
    };
    const dragleave = e => {
      e.dataTransfer.dropEffect = "none"; // 禁用
    };
    const drop = e => {
      let blocks = data.value.blocks; // 内部已经渲染的组件
      data.value = {
        ...data.value,
        blocks: [
          ...blocks,
          {
            top: e.offsetY,
            left: e.offsetX,
            zIndex: 1,
            key: currentComponent.key,
            alignCenter: true, // 松手的时候居中
          }
        ]
      }
      // 用完在置空
      currentComponent = null;

    };

    const dragStart = (e, component) => {
      console.log("dragStart", containerRef);
      // dragenter 进入元素中
      // dragover 在目标元素经过，必须 要阻止默认行为，苟泽不能触发 drop
      // dragleave 离开元素的时候，需要增加一个禁用的标识
      // drop 松手的时候，根据拖拽的组件 添加一个组件
      containerRef.value.addEventListener("dragenter", dragenter);
      containerRef.value.addEventListener("dragover", dragover);
      containerRef.value.addEventListener("dragleave", dragleave);
      containerRef.value.addEventListener("drop", drop);
      currentComponent = component
    };

    return () => (
      <div class="editor">
        <div className="editor-left">
          {config.componentList.map(component => (
            <div
              className="editor-left-item"
              draggable
              ondragstart={e => dragStart(e, component)}
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
