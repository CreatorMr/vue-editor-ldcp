import { reactive } from "vue";
import { events } from "./events";

/**
 * 实现拖拽多个元素
 * @param {*} focusData
 * @param {*} lastSelectBlock 最后选中拖动的元素
 * @returns
 */
export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false
  };

  let markLine = reactive({
    x: null,
    y: null
  });
  const mousedown = e => {
    console.log(lastSelectBlock.value);

    const { width: BWidth, height: BHeight } = lastSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY, // 记录每一个选中的位置
      dragging: false,
      startLeft: lastSelectBlock.value.left, // B 点拖拽前的 left 和 top
      startTop: lastSelectBlock.value.top,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        //计算辅助线  和没有选中的 block之间计算
        const { unfocused } = focusData.value;
        let lines = { x: [], y: [] }; // 计算横线的位置 用 y 来存放, x 存放纵向
        [
          ...unfocused,
          {
            width: data.value.container.width,
            height: data.value.container.height,
            top: 0,
            left: 0
          }
        ].forEach(block => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight
          } = block;
          // 主要看 A  B 之间的关系
          /**
           * 顶对顶
           * 顶对底
           * 中对中
           * 底对顶
           * 底对底
           */
          //lines y 中 showTop 线的位置 描点  top 为 移动元素的 实时top 所要到达的位置。
          // 当前次元素拖拽的时候和A 的元素top一直的时候，要显示这根辅助线，辅助线的位置就是ATop
          lines.y.push({ showTop: ATop, top: ATop });
          lines.y.push({ showTop: ATop, top: ATop - BHeight }); // 顶对底
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2
          }); // 中对中
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); //底对顶
          lines.y.push({
            showTop: ATop + AHeight - BHeight,
            top: ATop + AHeight
          }); // 底对底

          lines.x.push({ showLeft: ALeft, left: ALeft }); //左对左 同理 5中
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth
          });
          lines.x.push({ showLeft: ALeft, left: ALeft - BWidth });
        });
        console.log(lines);
        return lines;
      })()
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  const mousemove = e => {
    let { clientX: moveX, clientY: moveY } = e;

    if(!dragState.dragging) {
      dragState.dragging = true
      events.emit('start')
    }

    // 计算当前元素最新的left 和 top  去lines 里面找，找到显示线
    // 鼠标移动后 - 鼠标移动前 + left
    // 计算当前元素最新的left和top 去线里面找，找到显示线
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;

    // 先计算横线  距离 参照物元素还有  5px 的时候就线上 这根线

    let y = null;
    let x = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i]; // 获取每一根线
      if (Math.abs(t - top) < 5) {
        // 如果小于五说明接近了
        y = s; // 线要现实的位置
        moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
        // 实现快速和这个元素贴在一起
        break; // 找到一根线后就跳出循环
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { showLeft: s, left: l } = dragState.lines.x[i];
      if (Math.abs(l - left) < 5) {
        x = s; // 线要显示的位置
        // 快速贴合到目标位置
        moveX = dragState.startX - dragState.startLeft + l;
        break; // 找到一根线之后就跳出循环
      }
    }

    markLine.x = x; // markLine 是一个响应式数据，xy 更新会导致视图更新
    markLine.y = y;

    let durX = moveX - dragState.startX; // 之前和之后拖拽的位移
    let durY = moveY - dragState.startY;
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY;
      block.left = dragState.startPos[idx].left + durX;
    });
  };
  const mouseup = e => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    markLine.x = null;
    markLine.y = null;
    if(dragState.dragging) {
      events.emit('end')
    }
  };

  return {
    mousedown,
    markLine
  };
}
