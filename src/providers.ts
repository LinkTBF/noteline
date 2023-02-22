import * as vscode from 'vscode'
import * as fs from 'fs'
import { jumpToLine } from './shared'
import {
  MsgTypeFromWebviewToVscode,
	MsgDataFromWebviewToVscode
} from './basic/message'

/**
 * Register noteline webview provider and other provider here
 *
 * @param {vscode.ExtensionContext} context
 */
export function registerProviders(context: vscode.ExtensionContext) {
	const noteline = new NotelineViewProvider(context.extensionUri)
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(NotelineViewProvider.viewType, noteline, {
		webviewOptions: { retainContextWhenHidden: true }
	}))
}

/**
 * @class NotelineViewProvider
 * @typedef {NotelineViewProvider}
 * @implements {vscode.WebviewViewProvider}
 */
export class NotelineViewProvider implements vscode.WebviewViewProvider {
	static readonly viewType = 'noteline_view'
	static view: vscode.WebviewView
	static webview: vscode.Webview
	static html: string

	/**
	 * @constructor
	 * @param {vscode.Uri} _extensionUri
	 */
	constructor(private _extensionUri: vscode.Uri) {
		const htmlUri = vscode.Uri.joinPath(this._extensionUri, 'src/webview', 'index.html')
		NotelineViewProvider.html = fs.readFileSync(htmlUri.fsPath, 'utf8')
	}

	/**
	 * Resolve webview and webviewView
	 *
	 * @public
	 * @param {vscode.WebviewView} webviewView
	 */
	public resolveWebviewView(webviewView: vscode.WebviewView) {
		NotelineViewProvider.view = webviewView
		NotelineViewProvider.webview = webviewView.webview

		webviewView.webview.options = { enableScripts: true, localResourceRoots: [ this._extensionUri ] }
		webviewView.webview.html = this._getHtml(webviewView.webview)
		this._handMessageFromWebview(webviewView.webview)
	}

	/**
	 * Handle the commands from webview
	 *
	 * @private
	 * @param {vscode.Webview} webview
	 */
	private _handMessageFromWebview(webview: vscode.Webview) {
		webview.onDidReceiveMessage(async (message) => {
			const msgType = message.type as MsgTypeFromWebviewToVscode

			if (msgType === 'JUMP') {
				const msgData = message.data as MsgDataFromWebviewToVscode[typeof msgType]
				jumpToLine(msgData.filepath, parseInt(msgData.line))
				return
			}
		})
	}

	/**
	 * Generate html string for webview
	 *
	 * @private
	 * @param {vscode.Webview} webview
	 * @returns {string}
	 */
	private _getHtml(webview: vscode.Webview): string {
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/webview', 'app.css'))
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'build/ts/compiled', 'index.es.js'))

		return NotelineViewProvider.html
			.replace('app.css',  styleUri.toString())
			.replace('./index.ts', scriptUri.toString())
	}


}