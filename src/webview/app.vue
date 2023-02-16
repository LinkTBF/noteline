<template>
  <div>
    <draggable :style="{ height: customBoxHeight }" class="note-custom"
               :list="notes.custom" item-key="id" group="note" @change="change" @start="drag = true"
               @end="drag = false"
    >
      <template #item="{ element, index }">
        <div class="note-item" :data-note-item-index="index" @click="jump(index)">
          {{ element.content }}
        </div>
      </template>
    </draggable>
    <draggable class="note-system"
               :list="notes.system" item-key="id" group="note" @change="change" @start="drag = true"
               @end="drag = false"
    >
      <template #item="{ element }">
        <div class="note-item">
          {{ element.content }}
        </div>
      </template>
    </draggable>
    <!-- <div style='position: fixed;top: 12vh;z-index: 999;background-color: red;width: 100%;height: 10px;cursor:ns-resize'></div> -->
  </div>
</template>

<script setup lang='ts'>
import draggable from 'vuedraggable'
import { ref, reactive, computed } from 'vue'
import { Note, createNote } from '../noteline'

const drag = ref(false)

const notes = reactive<{
  system: Note[],
  custom: Note[]
}>({ 
  system: [],
  custom: []
})

const ratio = ref(0.5)
const customBoxHeight = computed({
  get: () => {
    return `${ 100 * ratio.value }vh`
  },
  set: () => null
})

if (mock) {
  notes.system = [ createNote('demo', 'demo1', 1) ]
  notes.custom = [ createNote('demo', 'demo2', 1), createNote('demo1', 'demo2', 1)  ]
}

const jump = (index: number) => {
  vscode.postMessage({
    command: 'JUMP',
    filepath: notes.custom[index].filepath,
    content: notes.custom[index].content,
    line: notes.custom[index].line
  })
}

const change = () => {
  vscode.setState({
    system: notes.system,
    custom: notes.custom
  })
}

const curSelectedIndex = ref<number | null>(null)
window.addEventListener('contextmenu', (e: any) => {
  if (e?.target?.dataset?.noteItemIndex) {
    curSelectedIndex.value = parseInt(e.target.dataset.noteItemIndex)
  } else {
    curSelectedIndex.value = null
  }
})

const oldState = vscode.getState()
if(oldState !== undefined) {
  notes.system = oldState.system
  notes.custom = oldState.custom
}

window.addEventListener('message', event => {
  const message = event.data

  if (message.command === 'ADD_RECORD') {
    const record = JSON.parse(message.data)
    notes.custom.push(record)
    vscode.setState({
      system: notes.system,
      custom: notes.custom
    })
  }

  if (message.command === 'DELETE_NOTE') {
    if(curSelectedIndex.value !== null) {
      notes.custom.splice(curSelectedIndex.value, 1)
    }
  }
})
</script>
