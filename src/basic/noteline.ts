import { basename } from './utils'
import { orderBy, findIndex } from 'lodash'

export type NoteColor = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE' | 'PURPLE'
export type NoteColorMapping = Record<NoteColor, string>
export type NoteType = 'CUSTOM' | 'SYSTEM'

export interface Note {
  id: string,
  filepath: string,
  basename: string,
  line: number,
  content: string,
	color: NoteColor,
  type: NoteType,
	remark: string,
	update: number,
  trend: number
}

export const DefaultNoteColorMapping: NoteColorMapping = {
  RED: '#E82F38',
  ORANGE: '#F3A128',
  YELLOW: '#EFDB69',
  GREEN: '#179742',
  BLUE: '#0D4C9A',
  PURPLE: '#C358E2'
} as const

export function createNote(
  filepath: string,
  content: string,
  line: number,
  options?: {
    color?: NoteColor,
    type?: NoteType,
    remark?: string
  }
): Note {
  return {
    id: `${filepath}${content}${line}`,
    line, content, filepath,
    basename: basename(filepath),
    color: options?.color || 'RED',
    type: options?.type || 'CUSTOM',
    remark: options?.remark || '',
    update: new Date().getTime(),
    trend: 0,
  }
}

export function orderNotes(
  notes: Note[],
  key = 'trend',
  orders: 'desc' | 'asc' = 'desc'
): Note[] {
  return orderBy(notes, key, orders)
}

export function findNote(notes: Note[], searchNote: Note): {
  note: Note,
  index: number
} | null {
  const index = findIndex(notes, { id: searchNote.id })
  if (index === -1) return null
  return {
    note: notes[index],
    index
  }
}