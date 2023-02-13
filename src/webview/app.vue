<template>
  <div>
    <draggable :list='notes.custom' item-key='id' group='note' @change='change' @start='drag = true'
               @end='drag = false'>
      <template #item='{ element }'>
        <div>{{ element.content }}</div>
      </template>
    </draggable>
    <hr>
    <draggable :list='notes.system' item-key='id' group='note' @change='change' @start='drag = true'
               @end='drag = false'>
      <template #item='{ element }'>
        <div>{{ element.content }}</div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang='ts'>
import draggable from 'vuedraggable'
import { ref, reactive } from 'vue'
import { Note } from '../noteline'

const drag = ref(false)

const notes = reactive<{
  system: Note[],
  custom: Note[]
}>({ 
  system: [],
  custom: []
})

const change = (e: any) => {
  vscode.setState({
    system: notes.system,
    custom: notes.custom
  })
}

const oldState = vscode.getState()
console.log(oldState)
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
})
</script>

<style>

</style>
