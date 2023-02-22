export type MsgField<T extends string> = Record<T, string>

export interface MsgDataFromWebviewToVscode {
  'JUMP': MsgField<'filepath' | 'line'>
}

export type MsgTypeFromWebviewToVscode = keyof MsgDataFromWebviewToVscode

export interface MsgFromWebviewToVscode<T extends MsgTypeFromWebviewToVscode> {
  type: T,
  data: MsgDataFromWebviewToVscode[T]
}

export function sendMsgFromWebviewToVscode<T extends MsgTypeFromWebviewToVscode>(
  vscode: any,
  type: T,
  data: MsgDataFromWebviewToVscode[T]
) {
	const msg: MsgFromWebviewToVscode<T> = { type, data }
	vscode.postMessage(msg)
}

export interface MsgDataFromVscodeToWebview {
  'ADD_NOTE': MsgField<'note'>,
  'RECORD': MsgField<'note'>,
  'ADD_TREND': MsgField<'filepath' | 'startLine' | 'endLine'>,
  'DELETE_SELECTED_NOTE': '',
  'CLEAR_SYSTEM_NOTES': '',
  'EDIT_REMARK': '',
}

export type MsgTypeFromVscodeToWebview = keyof MsgDataFromVscodeToWebview

export interface MsgFromVscodeToWebview<T extends MsgTypeFromVscodeToWebview> {
  type: T,
  data: MsgDataFromVscodeToWebview[T]
}

export function sendMsgFromVscodeToWebview<T extends MsgTypeFromVscodeToWebview>(
  webview: any,
  type: T,
  data: MsgDataFromVscodeToWebview[T]
) {
	const msg: MsgFromVscodeToWebview<T> = { type, data }
	webview.postMessage(msg)
}