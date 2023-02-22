<template>
  <div>
    <draggable v-for="draggableObj in draggables" class="draggable" :list="notes[draggableObj.key]"
               :style="{top: draggableObj.top}" item-key="id" group="note"
               @change="change($event, draggableObj.type)"
    >
      <template #item="{ element, index }">
        <div class="note-item" :data-note-item-index="index" :data-note-item-type="element.type"
             :style="{backgroundColor: selectedNoteIndex === index && selectedNoteType === element.type ? 'var(--vscode-dropdown-background)' : ''}"
             @click="jump(index, element.type)"
        >
          <div class="top">
            <div class="line">{{ element.line }}</div>
            <div class="basename nowarp">{{ element.basename }}</div>
          </div>
          <div class="bottom nowarp">
            {{ element.remark || element.content }}
            <div class="trend">{{ element.trend }}</div>
          </div>
        </div>
      </template>
    </draggable>

    <div class="head" style="top: 0px;">
      Custom Notes
    </div>

    <div class="head" style="top: 50vh">
      System Records
    </div>

    <div id="input-duck">
      <input v-show="isShowInput" id="input" ref="input" v-model="remark"
             @blur="editConfirm" @keyup.enter="editConfirm"
      >
    </div>
  </div>
</template>

<script setup lang='ts'>
import draggable from 'vuedraggable'
import { take } from 'lodash'
import { ref, reactive, nextTick } from 'vue'
import { Note, createNote, NoteType, findNote, orderNotes } from '../basic/noteline'
import {
  MsgTypeFromVscodeToWebview,
  MsgDataFromVscodeToWebview,
  sendMsgFromWebviewToVscode
} from '../basic/message'

// PROXY VAR ------------------------------------

const maxTrend = 300
const maxSystemLength = 100
const minContentLength = 6

const draggables = ref<{
  key: 'custom' | 'system',
  type: NoteType,
  top: string
}[]>([{
  key: 'custom',
  type: 'CUSTOM',
  top: 'var(--noteline-base-height)'
}, {
  key: 'system',
  type: 'SYSTEM',
  top: 'calc(50vh + var(--noteline-base-height))'
}])
const notes = reactive<{ system: Note[], custom: Note[] }>({ system: [], custom: [] })
const remark = ref('')
const input = ref<any>(null)
const isShowInput = ref<boolean>(false)
const selectedNoteIndex = ref<number  | null>(null)
const selectedNoteType = ref<NoteType | null>(null)

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

function syncNotes(options?: {
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

function editConfirm() {
  if (!remark.value) {
    return
  }

  const selectedNote = getSelectedNote()
  selectedNote && (selectedNote.remark = remark.value)
  remark.value = ''
  isShowInput.value = false

  syncNotes()
}

function noteTypeToKey(type: NoteType): 'custom' | 'system' {
  return type === 'CUSTOM' ? 'custom' : 'system'
}

function getSelectedNote(): Note | null {
  if (selectedNoteType.value === null || selectedNoteIndex.value === null) {
    return null
  }
  return notes[noteTypeToKey(selectedNoteType.value)][selectedNoteIndex.value]
}

function setSelectedNote(index: number | null, type: NoteType | null) {
  selectedNoteIndex.value = index
  selectedNoteType.value = type
}

function deleteSelectedNote() {
  if(selectedNoteType.value === null || selectedNoteIndex.value === null) {
    return
  }
  notes[noteTypeToKey(selectedNoteType.value)].splice(selectedNoteIndex.value, 1)
}

function change(e: any, noteType: NoteType) {
  e?.added && (e.added.element.type = noteType)
  syncNotes()
}

function jump(index: number, type: NoteType) {
  setSelectedNote(index, type)
  const note = notes[noteTypeToKey(type)][index]

  sendMsgFromWebviewToVscode(vscode, 'JUMP', { filepath: note.filepath, line: note.line.toString() })
}

// LISTENER -------------------------------------

window.addEventListener('contextmenu', (e: any) => {
  const noteItem = e.path.find((x: any) => x.className === 'note-item')
  if (noteItem?.dataset?.noteItemIndex && noteItem?.dataset?.noteItemType) {
    setSelectedNote(parseInt(noteItem.dataset.noteItemIndex), noteItem.dataset.noteItemType)
    return
  }

  setSelectedNote(null, null)
})

window.addEventListener('message', async e => {
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
        (x.trend < maxTrend) && (x.trend += 1)
        x.update = new Date().getTime()
      }
    })

    syncNotes({ isTake: true })
    return
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
  }

  if (msgType === 'DELETE_SELECTED_NOTE') {
    deleteSelectedNote()
    return
  }

  if (msgType === 'EDIT_REMARK') {
    const selectedNote = getSelectedNote()
    if (selectedNote) {
      isShowInput.value = true
      remark.value = selectedNote.remark || 'REMARK!'
      await nextTick()
      input.value.focus()
    }
  }

  if (msgType === 'CLEAR_SYSTEM_NOTES') {
    syncNotes({ system: [] })
    return
  }

  syncNotes()
})
</script>
