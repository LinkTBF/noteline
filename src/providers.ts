import * as vscode from 'vscode'

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

	constructor(private _extensionUri: vscode.Uri) {}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		NotelineViewProvider.view = webviewView
		NotelineViewProvider.webview = webviewView.webview

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [ this._extensionUri ]
		}
		webviewView.webview.html = this._getHtml(webviewView.webview)
	}

	private _getHtml(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'build/ts/compiled', 'index.es.js'))
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'build/ts', 'index.css'))
		return `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="${styleUri}" rel="stylesheet">
					<title>Noteline</title>
				</head>
				<body>
					<script> const vscode = acquireVsCodeApi() </script>
					<div id="app"></div>
					<script type="module" src="${scriptUri}"></script>
				</body>
			</html>`
	}
}