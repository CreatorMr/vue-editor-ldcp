import { computed, defineComponent, inject, onMounted, ref } from 'vue'

export default defineComponent({
  props: {
    block: { type: Object },
  },

  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex,
    }))
    console.log(blockStyles, 'blockStyles')

    const config = inject('config')
    console.log(config, 'config');

    const blockRef = ref(null)
    // 渲染完成
    onMounted(() => {

      let { offsetWidth, offsetHeight} = blockRef.value
      if(props.block.alignCenter) {
        props.block.left = props.block.left - offsetWidth/2
        props.block.top = props.block.top - offsetHeight/2

        props.block.alignCenter = false
      }

    })
    return () => {
      const component = config.componentMap[props.block.key]
      const RenderComponent = component.render()
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
        </div>
      )
    }
  },
})
