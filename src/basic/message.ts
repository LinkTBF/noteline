export type MsgField<T extends string> = Record<T, string>

// Message proto define from webview to vscode

export interface MsgDataFromWebviewToVscode {
  'JUMP': MsgField<'filepath' | 'line'>
}

export type MsgTypeFromWebviewToVscode = keyof MsgDataFromWebviewToVscode

export interface MsgFromWebviewToVscode<T extends MsgTypeFromWebviewToVscode> {
  type: T,
  data: MsgDataFromWebviewToVscode[T]
}

// Message proto define from vscode to webview

export interface MsgDataFromVscodeToWebview {
  'ADD_NOTE': MsgField<'note'>,
  'RECORD': MsgField<'note'>,
  'ADD_TREND': MsgField<'filepath' | 'startLine' | 'endLine'>,
  'DELETE_SELECTED_NOTE': '',
  'CLEAR_SYSTEM_NOTES': ''
}

export type MsgTypeFromVscodeToWebview = keyof MsgDataFromVscodeToWebview

export interface MsgFromVscodeToWebview<T extends MsgTypeFromVscodeToWebview> {
  type: T,
  data: MsgDataFromVscodeToWebview[T]
}