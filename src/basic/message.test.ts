import { sendMsgFromVscodeToWebview, sendMsgFromWebviewToVscode } from './message'
import assert from 'assert'

describe('message.ts', () => {

  describe('sendMsgFromVscodeToWebview',() => {
    it('should work', () => {
      let temp: any
      const webview = {
        postMessage(msg: any) {
          temp = msg
        }
      }
      sendMsgFromVscodeToWebview(webview, 'ADD_TREND', {
        filepath: 'demo.ts',
        startLine: '0',
        endLine: '4'
      })

      assert(temp.type === 'ADD_TREND')
      assert(temp.data.filepath === 'demo.ts')
      assert(temp.data.startLine === '0')
      assert(temp.data.endLine === '4')
    })
  })

  describe('sendMsgFromWebviewToVscode',() => {
    it('should work', () => {
      let temp: any
      const vscode = {
        postMessage(msg: any) {
          temp = msg
        }
      }
      sendMsgFromWebviewToVscode(vscode, 'JUMP', {
        filepath: 'demo.ts',
        line: '1'
      })
      
      assert(temp.type === 'JUMP')
      assert(temp.data.filepath === 'demo.ts')
      assert(temp.data.line === '1')
    })
  })

})
