import * as vscode from 'vscode'
import { Note, createNote } from './noteline'
import { NotelineViewProvider } from './providers'

export function registerCommands(context: vscode.ExtensionContext) {
	const commands: Record<string, () => void> = {
		open: defaultCommand,
		close: defaultCommand,
		deleteCustomNote: deleteCustomNoteCommand,
		record: recordCommand,
		show: defaultCommand
	}

	for (const key in commands) {
		context.subscriptions.push(vscode.commands.registerCommand(`noteline.${key}`, commands[key]))
	}
}

export function recordCommand() {
	const activeEditor = vscode.window.activeTextEditor

	if (activeEditor) {
		const document = activeEditor.document
		const curPos = activeEditor.selection.active

		const note: Note = createNote(document.fileName, document.lineAt(curPos.line).text, curPos.line)
		
		NotelineViewProvider.webview.postMessage({ command: 'ADD_RECORD', data: JSON.stringify(note) })
	}
}

export function deleteCustomNoteCommand() {
	NotelineViewProvider.webview.postMessage({ command: 'DELETE_NOTE', data: true })
}

export function defaultCommand() {
	console.log('defaultCommand')
}