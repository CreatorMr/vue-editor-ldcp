import { computed } from "vue"

export function useFocus(data, cb) {
  const focusData = computed(() => {
    let focus = []
    let unfocused = []
    data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
    return {
      focus,
      unfocused
    }
  })
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
    cb(e)
  }


  const containerMousedown = () => {
    console.log('dd')
    clearBlockFocus()
  }

  return {
    containerMousedown,
    blockMousedown,
    focusData,
  }
}
