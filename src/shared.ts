import * as vscode from 'vscode'

export function jumpToLine(filepath: string, line: number) {
  const selection = new vscode.Range(
    new vscode.Position(line, 0),
    new vscode.Position(line, 0),
  )

  vscode.workspace.openTextDocument(vscode.Uri.file(filepath)).then(async (doc) => {
    vscode.window.showTextDocument(doc, { selection })
  })
}

