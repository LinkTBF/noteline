import * as vscode from 'vscode'
import * as path from 'path'
import { chance } from './basic/utils'
import { Note } from './noteline'
import { NotelineViewProvider } from './providers'

export function registerCommands(context: vscode.ExtensionContext) {
	const commands: Record<string, () => void> = {
		open: defaultCommand,
		close: defaultCommand,
		setting: defaultCommand,
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

		const note: Note = {
			id: chance.hash(),
			color: 'RED',
			line: curPos.line,
			content: document.lineAt(curPos.line).text,
			filepath: document.fileName,
			basename: path.basename(document.fileName),
			type: 'CUSTOM',
			remark: '',
			update: new Date(),
			trend: 0
		}

		NotelineViewProvider.webview.postMessage({ command: 'ADD_RECORD', data: JSON.stringify(note) })
	}
}

export function defaultCommand() {
	console.log('defaultCommand')
}