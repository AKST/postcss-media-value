import { create as createState } from './state'
import { parsePropertyValue } from '~/parsing'

export function readDecl (state, decl) {
  const result = parsePropertyValue(decl.value)
  switch (result.type) {
    case 'normal': return
    case 'error': throw decl.error(result.reason)
    case 'responsive': {
      console.log(result.value)
      break
    }
  }
}

export { createState }
