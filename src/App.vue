<template>
  <div class="app">
    <editor v-model="state" />
    <!-- modelValue @update:modelValue -->
  </div>
</template>

<script>
import { ref, provide } from 'vue'
import Editor from './packages/editor.jsx'
import data from './data.json'
import { registerConfig as config } from './utils/editor-config.jsx'
export default {
  components: {
    Editor
  },

  setup() {
    const state = ref(data)

    provide('config', config) // 将组件的配置直接提供出去

    return {
      state
    }
  }
}
</script>

<style lang="scss">
.app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
