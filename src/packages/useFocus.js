import { computed, ref } from "vue";

export function useFocus(data, cb) {
  const selectIndex = ref(-1);

  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);

  const focusData = computed(() => {
    let focus = [];
    let unfocused = [];
    data.value.blocks.forEach(block =>
      (block.focus ? focus : unfocused).push(block)
    );
    return {
      focus,
      unfocused
    };
  });
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => (block.focus = false));
  };
  const blockMousedown = (e, block, index) => {
    console.log("block mousedown");
    e.preventDefault();
    e.stopPropagation();
    // block 上我们规划一个属性 focus获取焦点后就将focus 变为true

    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true; // 当前只有一个节点被选中时候，摁住shift也不会切换focus状态
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true;
      }
      // 如果选中某一个多次点击也不会取消，一直标记为选中状态
      // else {
      //   block.focus = false;
      // }
    }
    selectIndex.value = index;
    cb(e);
  };

  const containerMousedown = () => {
    console.log("dd");
    clearBlockFocus();
    selectIndex.value = -1;
  };

  return {
    containerMousedown,
    blockMousedown,
    focusData,
    lastSelectBlock
  };
}
