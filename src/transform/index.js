// @flow

import State, { create as createState } from '~/transform/state'
import * as util from '~/transform/util'
import { parseProperty } from '~/parsing'

export function readDecl (state: State, decl: Object) {
  const result = parseProperty(decl.value)
  switch (result.type) {
    case 'normal': return
    case 'error': throw decl.error(result.reason)
    case 'responsive': {
      const path = util.getPath(decl)
      state.record(path, result.segments)
      break
    }
  }
}

export { createState }
