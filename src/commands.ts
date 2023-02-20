import * as vscode from 'vscode'
import { Note, createNote } from './basic/noteline'
import { NotelineViewProvider } from './providers'
import {
  MsgTypeFromVscodeToWebview,
	MsgFromVscodeToWebview
} from './basic/message'

export function registerCommands(context: vscode.ExtensionContext) {
	const commands: Record<string, () => void> = {
		addNote: addNoteCommand,
		deleteCustomNote: deleteCustomNoteCommand,
		clearSystemNotes: clearSystemNotesCommand
	}

	for (const key in commands) {
		context.subscriptions.push(vscode.commands.registerCommand(`noteline.${key}`, commands[key]))
	}
}

export function addNoteCommand() {
	const activeEditor = vscode.window.activeTextEditor

	if (activeEditor) {
		const document = activeEditor.document
		const line = activeEditor.selection.active.line

		const note: Note = createNote(document.fileName, document.lineAt(line).text, line)

		const msgType: MsgTypeFromVscodeToWebview = 'ADD_NOTE'
		const msg: MsgFromVscodeToWebview<typeof msgType> = {
			type: msgType,
			data: {
				note: JSON.stringify(note)
			}
		}
		NotelineViewProvider.webview.postMessage(msg)
	}
}

export function deleteCustomNoteCommand() {
	const msgType: MsgTypeFromVscodeToWebview = 'DELETE_SELECTED_NOTE'
	const msg: MsgFromVscodeToWebview<typeof msgType> = {
		type: msgType,
		data: ''
	}
	NotelineViewProvider.webview.postMessage(msg)
}

export function clearSystemNotesCommand() {
	const msgType: MsgTypeFromVscodeToWebview = 'CLEAR_SYSTEM_NOTES'
	const msg: MsgFromVscodeToWebview<typeof msgType> = {
		type: msgType,
		data: ''
	}
	NotelineViewProvider.webview.postMessage(msg)
}