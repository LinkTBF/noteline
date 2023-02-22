import * as vscode from 'vscode'
import { Note, createNote } from './basic/noteline'
import { NotelineViewProvider } from './providers'
import { sendMsgFromVscodeToWebview } from './basic/message'

export function registerListeners() {

	vscode.window.onDidChangeTextEditorSelection(e => {
		const document = e.textEditor.document
		const line = e.selections[0].anchor.line

		const note: Note = createNote(document.fileName, document.lineAt(line).text, line, {
			type: 'SYSTEM'
		})

		sendMsgFromVscodeToWebview(NotelineViewProvider.webview, 'RECORD', { note: JSON.stringify(note) })
	})

	vscode.window.onDidChangeTextEditorVisibleRanges(e => {
		const fileName = e.textEditor.document.fileName
		
		sendMsgFromVscodeToWebview(
			NotelineViewProvider.webview,
			'ADD_TREND',
			{
				filepath: fileName,
				startLine: e.visibleRanges[0].start.line.toString(),
				endLine: e.visibleRanges[0].end.line.toString()
			}
		)
	})
}