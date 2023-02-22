type VSCode = {
  postMessage(message: any): void,
  getState(): any,
  setState(state: any): void,
  window: any
}

declare const vscode: VSCode
declare const mock: boolean
