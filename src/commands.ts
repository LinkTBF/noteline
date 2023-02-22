import * as vscode from 'vscode'
import { Note, createNote } from './basic/noteline'
import { NotelineViewProvider } from './providers'
import { sendMsgFromVscodeToWebview } from './basic/message'

export function registerCommands(context: vscode.ExtensionContext) {
	const commands: Record<string, () => void> = {
		addNote: () => {
			const activeEditor = vscode.window.activeTextEditor

			if (!activeEditor) {
				return
			}

			const document = activeEditor.document
			const line = activeEditor.selection.active.line
			const note: Note = createNote(document.fileName, document.lineAt(line).text, line)

			sendMsgFromVscodeToWebview(NotelineViewProvider.webview, 'ADD_NOTE', { note: JSON.stringify(note) })
		},
		deleteCustomNote: () => {
			sendMsgFromVscodeToWebview(NotelineViewProvider.webview, 'DELETE_SELECTED_NOTE', '')
		},
		clearSystemNotes: () => {
			sendMsgFromVscodeToWebview(NotelineViewProvider.webview, 'CLEAR_SYSTEM_NOTES', '')
		},
		editRemark: () => {
			sendMsgFromVscodeToWebview(NotelineViewProvider.webview, 'EDIT_REMARK', '')
		}
	}

	for (const key in commands) {
		context.subscriptions.push(vscode.commands.registerCommand(`noteline.${key}`, commands[key]))
	}
}