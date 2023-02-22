import { createNote, orderNotes, Note, findNote } from './noteline'
import assert from 'assert'

describe('noteline.ts', () => {

  describe('createNote',() => {
    it('should work', () => {
      const note = createNote('/demo/demo.ts', 'content demo', 13)
      assert(note.basename === 'demo.ts')
      assert(note.color === 'RED')
      assert(note.filepath === '/demo/demo.ts')
      assert(note.content === 'content demo')
      assert(note.id === '/demo/demo.tscontent demo13')
      assert(note.line === 13)
      assert(note.trend === 0)
      assert(note.remark === '')
    })
  })
  
  describe('orderNotes',() => {
    let notes: Note[]
    beforeEach(() => {
      notes = [
        createNote('demo1', 'demo', 0),
        createNote('demo2', 'demo', 0),
        createNote('demo3', 'demo', 0)
      ]
    })

    it('should order trend', () => {
      notes[0].trend = 1
      notes[1].trend = 2
      notes[2].trend = 3

      const orderedNotes = orderNotes(notes)
      assert(orderedNotes[0].filepath === 'demo3')
      assert(orderedNotes[1].filepath === 'demo2')
      assert(orderedNotes[2].filepath === 'demo1')
    })

    it('should order update', () => {
      const now = new Date().getTime()
      notes[0].update = now - 10
      notes[1].update = now - 20
      notes[2].update = now - 30

      const orderedNotes = orderNotes(notes, 'update', 'asc')
      assert(orderedNotes[0].filepath === 'demo3')
      assert(orderedNotes[1].filepath === 'demo2')
      assert(orderedNotes[2].filepath === 'demo1')
    })
  })

  describe('findNote',() => {
    it('should found', () => {
      const toFindNote = createNote('demo2', 'demo', 0)
      const notes = [
        createNote('demo1', 'demo', 0),
        toFindNote,
        createNote('demo3', 'demo', 0)
      ]

      const foundRes = findNote(notes, toFindNote)
      assert(foundRes?.index === 1)
      assert(foundRes?.note.id === toFindNote.id)
    })

    it('should return null', () => {
      const toFindNote = createNote('demo2', 'demo', 0)
      const notes: Note[] = []

      const foundRes = findNote(notes, toFindNote)
      assert(foundRes === null)
    })
  })

})
