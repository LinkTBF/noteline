<template>
  <div>
    <div class="head" style="top: 0px;">
      Custom Notes
    </div>

    <draggable class="draggable" :list="notes.custom" style="top: var(--noteline-base-height);"
               item-key="id" group="note" @change="change($event, 'CUSTOM')"
    >
      <template #item="{ element, index }">
        <div class="note-item" :data-note-item-index="index" :data-note-item-type="element.type"
             @click="jump(index, element.type)"
        >
          <div class="top">
            <div class="line">{{ element.line }}</div>
            <div class="basename nowarp">{{ element.basename }}</div>
          </div>
          <div class="bottom nowarp">
            {{ element.content }}
            <div class="trend">{{ element.trend }}</div>
          </div>
        </div>
      </template>
    </draggable>

    <div class="head" style="top: 50vh">
      System Records
    </div>

    <draggable class="draggable system" :list="notes.system" style="top: calc(50vh + var(--noteline-base-height));"
               item-key="id" group="note" @change="change($event, 'SYSTEM')"
    >
      <template #item="{ element, index }">
        <div class="note-item" :data-note-item-index="index" :data-note-item-type="element.type"
             @click="jump(index, element.type)"
        >
          <div class="top">
            <div class="line">{{ element.line }}</div>
            <div class="basename nowarp">{{ element.basename }}</div>
          </div>
          <div class="bottom nowarp">
            {{ element.content }}
            <div class="trend">{{ element.trend }}</div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang='ts'>
import draggable from 'vuedraggable'
import { take } from 'lodash'
import { ref, reactive } from 'vue'
import { Note, createNote, NoteType, findNote, orderNotes } from '../basic/noteline'
import {
  MsgTypeFromWebviewToVscode,
  MsgFromWebviewToVscode,
  MsgTypeFromVscodeToWebview,
  MsgDataFromVscodeToWebview
} from '../basic/message'

// PROXY VAR ------------------------------------

const notes = reactive<{
  system: Note[],
  custom: Note[]
}>({ 
  system: [],
  custom: []
})
const maxTrend = 300
const maxSystemLength = 100
const minContentLength = 6
const curSelectedIndex = ref<number  | null>(null)
const curSelectedType = ref<NoteType | null>(null)

// MISC ---------------------------------------

if (mock) {
  notes.custom = [ createNote('custom1', 'custom1', 1), createNote('custom2', 'custom2', 1) ]
  notes.system = [ createNote('system1', 'system1', 1, { type: 'SYSTEM' }) ]
}

const oldState = vscode.getState()
if (oldState !== undefined) {
  notes.system = oldState.system
  notes.custom = oldState.custom
}

// FUNCTIONS -----------------------------------

function updateNotes(options?: {
  system?: Note[],
  custom?: Note[],
  isTake?: boolean
}) {
  options?.custom && (notes.custom = options?.custom)
  options?.system && (notes.system = options?.system)

  notes.custom = orderNotes(notes.custom)

  if (notes.system.length >= maxSystemLength && options?.isTake) {
    notes.system = take(orderNotes(notes.system, 'update'), 10)
  }
  notes.system = orderNotes(notes.system)

  vscode.setState({
    system: notes.system,
    custom: notes.custom
  })
}

function change(e: any, noteType: NoteType) {
  if (e?.added) {
    e.added.element.type = noteType
  }

  updateNotes()
}

function jump(index: number, noteType: NoteType) {
  let data: any

  if(noteType === 'CUSTOM') {
    data = {
      filepath: notes.custom[index].filepath,
      line: notes.custom[index].line.toString()
    }
  } else {
    data = {
      filepath: notes.system[index].filepath,
      line: notes.system[index].line.toString()
    }
  }

  const msgType: MsgTypeFromWebviewToVscode = 'JUMP'
  const msg: MsgFromWebviewToVscode<typeof msgType> = {
    type: msgType, data
  }
  vscode.postMessage(msg)
}

// LISTENER -------------------------------------

window.addEventListener('contextmenu', (e: any) => {
  if (e?.target?.dataset?.noteItemIndex) {
    curSelectedIndex.value = parseInt(e.target.dataset.noteItemIndex)
    curSelectedType.value = e.target.dataset.noteItemType
  } else {
    curSelectedIndex.value = null
    curSelectedType.value = null
  }
})

window.addEventListener('message', e => {
  const message = e.data
  const msgType = message.type as MsgTypeFromVscodeToWebview

  if (msgType === 'RECORD') {
    const msgData = message.data as MsgDataFromVscodeToWebview[typeof msgType]
    const note: Note = JSON.parse(msgData.note)

    note.content = note.content.trim()
    if (note.content.length < minContentLength) {
      return
    }

    const foundRes = findNote([ ...notes.custom, ...notes.system ], note)
    if (!foundRes) {
      notes.system.push(note)
    }

    updateNotes()
  }

  if (msgType === 'ADD_TREND') {
    const msgData = message.data as MsgDataFromVscodeToWebview[typeof msgType]
    const filepath = msgData.filepath
    const startLine = parseInt(msgData.startLine)
    const endLine = parseInt(msgData.endLine)

    notes.system.forEach(x => {
      if (x.filepath !== filepath) {
        return
      }

      if (x.line > startLine && x.line < endLine) {
        if (x.trend < maxTrend) {
          x.trend += 1
        }
        x.update = new Date().getTime()
      }
    })

    updateNotes({
      isTake: true
    })
  }

  if (msgType === 'ADD_NOTE') {
    const msgData = message.data as MsgDataFromVscodeToWebview[typeof msgType]
    const note: Note = JSON.parse(msgData.note)

    note.content = note.content.trim()

    const foundCustomRes = findNote(notes.custom, note)
    const foundSystemRes = findNote(notes.system, note)

    if (foundCustomRes) {
      return
    } else if (foundSystemRes) {
      notes.custom.push(note)
      notes.system.splice(foundSystemRes.index, 1)
    } else {
      notes.custom.push(note)
    }

    updateNotes()
  }

  if (msgType === 'DELETE_SELECTED_NOTE') {
    if (curSelectedIndex.value === null || curSelectedType.value === null) {
      return
    }

    notes[curSelectedType.value === 'CUSTOM' ? 'custom' : 'system'].splice(curSelectedIndex.value, 1)
  }

  if (msgType === 'CLEAR_SYSTEM_NOTES') {
    updateNotes({
      custom: [],
      system: []
    })
  }
})
</script>
