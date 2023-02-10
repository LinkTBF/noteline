import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { chance, template } from './basic/utils'

interface NotelineRecord {
	history: Date[],
	icon: 'default' | 'star' | 'mark' | 'love' | 'ring',
	color: string,
	noteContent: string,
	charNum: number,
	lineNum: number,
	lineContent: string,
	filename: string,
	filepath: string
}

let uri: vscode.Uri
let webview: vscode.Webview

class WebviewProvider implements vscode.WebviewViewProvider {
	resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
		webviewView.webview.options = { enableScripts: true }
		webview = webviewView.webview
		
		const webviewCssUri = webview.asWebviewUri(vscode.Uri.joinPath(uri, 'src', 'webview.css'))
		const webviewJsUri = webview.asWebviewUri(vscode.Uri.joinPath(uri, 'src', 'webview.js'))
		const webviewHtml = fs.readFileSync(vscode.Uri.joinPath(uri, 'src', 'webview.html').fsPath, 'utf-8')
		const nonce = chance.hash({ length: 32 })

		webview.onDidReceiveMessage(
			message => {
				if (message.command === 'show') {
					const arr = message.text.split(';')
					const document = vscode.Uri.file(arr[2])
					const position = new vscode.Position(parseInt(arr[0]), parseInt(arr[1]))
					vscode.window.showTextDocument(
						document,
						{
							selection: new vscode.Range(position, position)
						}
					)
					return
				}
			}
		)

		webview.html = template(webviewHtml, {
			cspSource: webview.cspSource, nonce,
			webviewCssUri: webviewCssUri.toString(),
			webviewJsUri: webviewJsUri.toString()
		})

		// vscode.window.onDidChangeTextEditorVisibleRanges(e => {
		// 	console.log(e.visibleRanges)
		// 	console.log(e.textEditor)
		// })
	}
}

export function activate(context: vscode.ExtensionContext) {
	uri = context.extensionUri
	vscode.window.registerWebviewViewProvider('noteline_main_view', new WebviewProvider())
	
	registerCommands(context)
}

export function registerCommands(context: vscode.ExtensionContext) {
	const open = vscode.commands.registerCommand('noteline.open', () => {
		console.log('Open noteline')
	})

	const close = vscode.commands.registerCommand('noteline.close', () => {
		console.log('Close noteline')
	})

	const setting = vscode.commands.registerCommand('noteline.setting', () => {
		console.log('Setting noteline')
	})

	const record = vscode.commands.registerCommand('noteline.record', () => {
		const activeEditor = vscode.window.activeTextEditor
		if (activeEditor) {
			const document = activeEditor.document
			
			const curPos = activeEditor.selection.active
			const record: NotelineRecord = {
				history: [],
				icon: 'default',
				color: '#ffffff',
				noteContent: 'note',
				charNum: curPos.character,
				lineNum: curPos.line,
				lineContent: document.lineAt(curPos.line).text,
				filepath: document.fileName,
				filename: path.basename(document.fileName)
			}
			webview.postMessage({ command: 'ADD_RECORD', data: JSON.stringify(record) })
		}
		
	})

	const showRecord = vscode.commands.registerCommand('noteline.showRecord', () => {
		console.log('showRecord')
	})

	context.subscriptions.push(open)
	context.subscriptions.push(close)
	context.subscriptions.push(setting)
	context.subscriptions.push(record)
	context.subscriptions.push(showRecord)
}
