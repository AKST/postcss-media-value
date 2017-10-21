// @flow
import * as postcss from 'postcss'
import { createState, readDecl, applyUpdate } from '~/transform'

export function withRoot (root: Object) {
  const state = createState()
  root.walkDecls(decl => readDecl(state, decl))
  applyUpdate(state, root)
}

export default postcss.plugin('postcss-responsive-value', (options = {}) => {
  return root => withRoot(root)
})
