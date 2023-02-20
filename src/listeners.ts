import * as vscode from 'vscode'
import { Note, createNote } from './basic/noteline'
import { NotelineViewProvider } from './providers'
import {
  MsgTypeFromVscodeToWebview,
	MsgFromVscodeToWebview
} from './basic/message'

export function registerListeners() {

	vscode.window.onDidChangeTextEditorSelection(e => {
		const document = e.textEditor.document
		const line = e.selections[0].anchor.line

		const note: Note = createNote(document.fileName, document.lineAt(line).text, line, {
			type: 'SYSTEM'
		})

		const msgType: MsgTypeFromVscodeToWebview = 'RECORD'
		const msg: MsgFromVscodeToWebview<typeof msgType> = {
			type: msgType,
			data: {
				note: JSON.stringify(note)
			}
		}
		NotelineViewProvider.webview.postMessage(msg)
	})

	vscode.window.onDidChangeTextEditorVisibleRanges(e => {
		const fileName = e.textEditor.document.fileName
		
		const msgType: MsgTypeFromVscodeToWebview = 'ADD_TREND'
		const msg: MsgFromVscodeToWebview<typeof msgType> = {
			type: msgType,
			data: {
				filepath: fileName,
				startLine: e.visibleRanges[0].start.line.toString(),
				endLine: e.visibleRanges[0].end.line.toString()
			}
		}
		NotelineViewProvider.webview.postMessage(msg)
		// const line = e.textEditor.selections.anchor.line
		// const note: Note = createNote(document.fileName, document.lineAt(line).text, line)
		
		// const msgType: MsgTypeFromVscodeToWebview = 'RECORD'
		// const msg: MsgFromVscodeToWebview<typeof msgType> = {
		// 	type: msgType,
		// 	data: {
		// 		note: JSON.stringify(note)
		// 	}
		// }
		// NotelineViewProvider.webview.postMessage(msg)
	})
}