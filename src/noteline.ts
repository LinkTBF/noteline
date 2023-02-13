
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
	update: Date,
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