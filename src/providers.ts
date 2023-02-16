import * as vscode from 'vscode'
import * as fs from 'fs'

export function registerProviders(context: vscode.ExtensionContext) {
	const noteline = new NotelineViewProvider(context.extensionUri)
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(NotelineViewProvider.viewType, noteline, {
		webviewOptions: { retainContextWhenHidden: true }
	}))
}

export class NotelineViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'noteline_view'
	public static view: vscode.WebviewView
	public static webview: vscode.Webview
	public static html: string

	constructor(private _extensionUri: vscode.Uri) {
		const htmlUri = vscode.Uri.joinPath(this._extensionUri, 'src/webview', 'index.html')
		NotelineViewProvider.html = fs.readFileSync(htmlUri.fsPath, 'utf8')
	}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		NotelineViewProvider.view = webviewView
		NotelineViewProvider.webview = webviewView.webview

		webviewView.webview.options = {
			// preventDefaultContextMenuItems: true,
			enableScripts: true,
			localResourceRoots: [ this._extensionUri ]
		}
		webviewView.webview.html = this._getHtml(webviewView.webview)
	}

	private _getHtml(webview: vscode.Webview) {
		webview.onDidReceiveMessage(async (message) => {
			switch (message.command) {
			case 'JUMP':
				console.log(message.filepath)
				vscode.workspace.openTextDocument(vscode.Uri.file(message.filepath)).then(async (doc) => {
					vscode.window.showTextDocument(doc, {
						selection: new vscode.Range(
							new vscode.Position(parseInt(message.line), 0), new vscode.Position(parseInt(message.line), 0),
						)
					})
				})
				return
			}
		})

		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/webview', 'app.css'))
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'build/ts/compiled', 'index.es.js'))

		return NotelineViewProvider.html
			.replace('app.css',  styleUri.toString())
			.replace('./index.ts', scriptUri.toString())
	}
}