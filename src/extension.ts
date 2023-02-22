import * as vscode from 'vscode'
import { registerProviders } from './providers'
import { registerCommands } from './commands'
import { registerListeners } from './listeners'

export function activate(context: vscode.ExtensionContext) {
	registerProviders(context)
	registerCommands(context)
	registerListeners()
}