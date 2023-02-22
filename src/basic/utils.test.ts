import { basename } from './utils'
import assert from 'assert'

describe('utils.ts', () => {

  describe('basename',() => {
    it('should work', () => {
      assert(basename('demo/demo/demo.ts') === 'demo.ts')
      assert(basename('/demo/demo.ts') === 'demo.ts')
      assert(basename('demo.ts') === 'demo.ts')
      assert(basename('') === '')
    })
  })

})
