import Chance from 'chance'
import _ from 'lodash'

export function template(source: string, data: Record<string, string>): string {
  return (_.template(source))(data)
}

// export function getRootPath(): string {
//   return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
//     ? vscode.workspace.workspaceFolders[0].uri.fsPath
//     : ''
// }

export const chance = new Chance()