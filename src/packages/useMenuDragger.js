export function useMenuDragger(data, containerRef) {
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

  const dragEnd = (e) => {
    containerRef.value.removeEventListener("dragenter", dragenter);
    containerRef.value.removeEventListener("dragover", dragover);
    containerRef.value.removeEventListener("dragleave", dragleave);
    containerRef.value.removeEventListener("drop", drop);
  }

  return {
    dragStart,
    dragEnd,
  }
}
