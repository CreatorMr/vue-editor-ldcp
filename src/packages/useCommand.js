import deepcopy from 'deepcopy'
import { onUnmounted } from 'vue'
import { events } from './events'

export function useCommand(data) {
  const state = {
    // 前进后退需要指针
    current: -1, // 前进后退的索引值

    queue: [], // 存放所有的操作命令
    commands: {}, // 制作命令和执行功能的一个映射表， undo: ()=> {}  redo: () => {}

    commandArray: [], // 存放所有的命令
    destroyArray: [], //销毁列表
  }

  const registry = (command) => {
    state.commandArray.push(command)
    state.commands[command.name] = () => {
      // 命令名字对应执行函数
      const { redo, undo } = command.execute()
      redo()

      if (!command.pushQueue) {
        // 如果不需要放到队列中直接跳过
        return
      }
      let { queue, current } = state

      // ???? 组件1 =》 组件 2 =》 组件3 =》 撤销
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1)
        state.queue = queue
      }

      queue.push({ redo, undo })
      state.current = current + 1
      console.log(queue)
    }
  }

  registry({
    name: 'redo',
    keyboard: 'ctrl + y',
    execute() {
      return {
        redo() {
          console.log('重做')
          const item = state.queue[state.current + 1]
          if (item) {
            item.redo && item.redo()
            state.current++
          }
        },
      }
    },
  })

  registry({
    name: 'undo',
    keyboard: 'ctrl + z',
    execute() {
      return {
        redo() {
          console.log('撤销')
          if (state.current === -1) return
          const item = state.queue[state.current]
          if (item) {
            item.undo && item.undo()
            state.current--
          }
        },
      }
    },
  })

  registry({
    // 如果希望将操作放到队列中可以增加一个属性，标识等会放到队列中
    name: 'drag',
    pushQueue: true,
    init() {
      this.before = null
      // 初始化操作，默认执行
      // 监控拖拽开始事件，保存状态
      const start = () => (this.before = deepcopy(data.value.blocks))
      // 拖拽之后需要触发
      const end = () => state.commands.drag()
      events.on('start', start)
      events.on('end', end)

      return () => {
        // 返回一个卸载函数
        events.off('start', start)
        events.off('end', end)
      }
    },
    execute() {
      let before = this.before
      let after = data.value.blocks // 之后的状态
      return {
        redo() {
          data.value = {
            ...data.value,
            blocks: after,
          }
        },
        undo() {
          data.value = {
            ...data.value,
            blocks: before,
          }
        },
      }
    },
  })

  const keyboardEvents = (() => {
    const keyCodes = {
      90: 'z',
      89: 'y',
    }

    const onKeydown = (e) => {
      console.log(e, '按键')
      const { ctrlKey, keyCode } = e

      let keyString = []
      if (ctrlKey) keyString.push('ctrl')
      keyString.push(keyCodes[keyCode])
      keyString = keyString.join('+')

      state.commandArray.forEach(({ keyboard, name }) => {
        console.log(keyString, 'keyString')
        if (!keyboard) return
        if (keyboard === keyString) {
          state.commands[name]()
          e.preventDefault()
        }
      })
    }
    const init = () => {
      window.addEventListener('keydown', onKeydown)
      return () => {
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })()
  ;(() => {
    state.destroyArray.push(keyboardEvents())
    state.commandArray.forEach(
      (command) => command.init && state.destroyArray.push(command.init()),
    )
  })()

  onUnmounted(() => {
    state.destroyArray.forEach((fn) => fn && fn())
  })
  return state
}
